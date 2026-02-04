/**
 * Service for handling organization join requests
 */
import { db } from '../utils/database';
import crypto from 'crypto';

export interface JoinRequest {
  id: string;
  organizationId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export class JoinRequestService {
  /**
   * Create a new join request
   */
  static createJoinRequest(organizationId: string, userId: string): JoinRequest {
    // Check if user is already a member
    const existingMember = db
      .prepare('SELECT * FROM organization_members WHERE organization_id = ? AND user_id = ?')
      .get(organizationId, userId);

    if (existingMember) {
      throw new Error('User is already a member of this organization');
    }

    // Check if there's already a pending request
    const existingRequest = db
      .prepare('SELECT * FROM join_requests WHERE organization_id = ? AND user_id = ? AND status = ?')
      .get(organizationId, userId, 'pending');

    if (existingRequest) {
      throw new Error('A join request is already pending for this organization');
    }

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO join_requests (id, organization_id, user_id, status)
      VALUES (?, ?, ?, 'pending')
    `);

    stmt.run(id, organizationId, userId);

    return this.getJoinRequestById(id)!;
  }

  /**
   * Get join request by ID
   */
  static getJoinRequestById(id: string): JoinRequest | null {
    const row = db
      .prepare('SELECT * FROM join_requests WHERE id = ?')
      .get(id) as any;

    return row ? this.mapRowToJoinRequest(row) : null;
  }

  /**
   * Get all pending join requests for an organization
   */
  static getPendingRequestsForOrganization(organizationId: string): JoinRequest[] {
    const rows = db
      .prepare('SELECT * FROM join_requests WHERE organization_id = ? AND status = ? ORDER BY requested_at DESC')
      .all(organizationId, 'pending') as any[];

    return rows.map(this.mapRowToJoinRequest);
  }

  /**
   * Approve a join request
   */
  static approveJoinRequest(requestId: string, reviewerId: string): void {
    const request = this.getJoinRequestById(requestId);
    if (!request) {
      throw new Error('Join request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Join request has already been reviewed');
    }

    // Start a transaction
    const updateRequest = db.prepare(`
      UPDATE join_requests 
      SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
      WHERE id = ?
    `);

    const addMember = db.prepare(`
      INSERT INTO organization_members (organization_id, user_id, is_admin)
      VALUES (?, ?, 0)
    `);

    const transaction = db.transaction(() => {
      updateRequest.run(reviewerId, requestId);
      addMember.run(request.organizationId, request.userId);
    });

    transaction();
  }

  /**
   * Reject a join request
   */
  static rejectJoinRequest(requestId: string, reviewerId: string): void {
    const request = this.getJoinRequestById(requestId);
    if (!request) {
      throw new Error('Join request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Join request has already been reviewed');
    }

    const stmt = db.prepare(`
      UPDATE join_requests 
      SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
      WHERE id = ?
    `);

    stmt.run(reviewerId, requestId);
  }

  /**
   * Map database row to JoinRequest object
   */
  private static mapRowToJoinRequest(row: any): JoinRequest {
    return {
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      status: row.status,
      requestedAt: new Date(row.requested_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by || undefined,
    };
  }
}
