import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  defaultOrganizationSettings,
} from '../models/Organization';
import { db } from '../utils/database';

/**
 * Service for managing organizations
 */
export class OrganizationService {
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new organization
   */
  public createOrganization(
    creatorId: string,
    orgData: CreateOrganizationDto
  ): Organization {
    const orgId = this.generateId();
    const now = new Date().toISOString();
    const settings = {
      ...defaultOrganizationSettings,
      ...orgData.settings,
    };

    const stmt = db.prepare(`
      INSERT INTO organizations (id, name, description, logo, website, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      orgId,
      orgData.name,
      orgData.description || '',
      orgData.logo || null,
      orgData.website || null,
      JSON.stringify(settings),
      now,
      now
    );

    // Add creator as admin member
    const memberStmt = db.prepare(`
      INSERT INTO organization_members (organization_id, user_id, is_admin)
      VALUES (?, ?, 1)
    `);
    memberStmt.run(orgId, creatorId);

    const organization: Organization = {
      id: orgId,
      name: orgData.name,
      description: orgData.description || '',
      logo: orgData.logo,
      website: orgData.website,
      adminIds: [creatorId],
      memberIds: [creatorId],
      settings,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    return organization;
  }

  /**
   * Get organization by ID
   */
  public getOrganizationById(id: string): Organization | undefined {
    const stmt = db.prepare('SELECT * FROM organizations WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      return undefined;
    }

    return this.mapRowToOrganization(row);
  }

  /**
   * Get all organizations
   */
  public getAllOrganizations(): Organization[] {
    const stmt = db.prepare('SELECT * FROM organizations');
    const rows = stmt.all() as any[];

    return rows.map(row => this.mapRowToOrganization(row));
  }

  /**
   * Get organizations where user is a member
   */
  public getOrganizationsByUserId(userId: string): Organization[] {
    const stmt = db.prepare(`
      SELECT o.* FROM organizations o
      INNER JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = ?
    `);
    const rows = stmt.all(userId) as any[];

    return rows.map(row => this.mapRowToOrganization(row));
  }

  /**
   * Update an organization
   */
  public updateOrganization(
    id: string,
    updateData: UpdateOrganizationDto
  ): Organization | undefined {
    const org = this.getOrganizationById(id);
    if (!org) {
      return undefined;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.name) {
      updates.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.description !== undefined) {
      updates.push('description = ?');
      values.push(updateData.description);
    }
    if (updateData.logo !== undefined) {
      updates.push('logo = ?');
      values.push(updateData.logo);
    }
    if (updateData.website !== undefined) {
      updates.push('website = ?');
      values.push(updateData.website);
    }
    if (updateData.settings) {
      const newSettings = { ...org.settings, ...updateData.settings };
      updates.push('settings = ?');
      values.push(JSON.stringify(newSettings));
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      const stmt = db.prepare(`
        UPDATE organizations
        SET ${updates.join(', ')}
        WHERE id = ?
      `);
      stmt.run(...values);
    }

    return this.getOrganizationById(id);
  }

  /**
   * Delete an organization
   */
  public deleteOrganization(id: string): boolean {
    const stmt = db.prepare('DELETE FROM organizations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Add a member to an organization
   */
  public addMember(orgId: string, userId: string): boolean {
    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO organization_members (organization_id, user_id, is_admin)
        VALUES (?, ?, 0)
      `);
      stmt.run(orgId, userId);
      
      const updateStmt = db.prepare('UPDATE organizations SET updated_at = ? WHERE id = ?');
      updateStmt.run(new Date().toISOString(), orgId);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove a member from an organization
   */
  public removeMember(orgId: string, userId: string): boolean {
    try {
      const stmt = db.prepare(`
        DELETE FROM organization_members
        WHERE organization_id = ? AND user_id = ?
      `);
      stmt.run(orgId, userId);
      
      const updateStmt = db.prepare('UPDATE organizations SET updated_at = ? WHERE id = ?');
      updateStmt.run(new Date().toISOString(), orgId);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add an admin to an organization
   */
  public addAdmin(orgId: string, userId: string): boolean {
    try {
      // First ensure user is a member
      this.addMember(orgId, userId);
      
      // Then promote to admin
      const stmt = db.prepare(`
        UPDATE organization_members
        SET is_admin = 1
        WHERE organization_id = ? AND user_id = ?
      `);
      stmt.run(orgId, userId);
      
      const updateStmt = db.prepare('UPDATE organizations SET updated_at = ? WHERE id = ?');
      updateStmt.run(new Date().toISOString(), orgId);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove an admin from an organization
   */
  public removeAdmin(orgId: string, userId: string): boolean {
    try {
      const stmt = db.prepare(`
        UPDATE organization_members
        SET is_admin = 0
        WHERE organization_id = ? AND user_id = ?
      `);
      stmt.run(orgId, userId);
      
      const updateStmt = db.prepare('UPDATE organizations SET updated_at = ? WHERE id = ?');
      updateStmt.run(new Date().toISOString(), orgId);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is an admin of the organization
   */
  public isAdmin(orgId: string, userId: string): boolean {
    const stmt = db.prepare(`
      SELECT is_admin FROM organization_members
      WHERE organization_id = ? AND user_id = ?
    `);
    const row = stmt.get(orgId, userId) as any;
    return row ? row.is_admin === 1 : false;
  }

  /**
   * Check if user is a member of the organization
   */
  public isMember(orgId: string, userId: string): boolean {
    const stmt = db.prepare(`
      SELECT 1 FROM organization_members
      WHERE organization_id = ? AND user_id = ?
    `);
    const row = stmt.get(orgId, userId);
    return !!row;
  }

  /**
   * Helper method to map database row to Organization object
   */
  private mapRowToOrganization(row: any): Organization {
    // Get members
    const membersStmt = db.prepare(`
      SELECT user_id, is_admin FROM organization_members
      WHERE organization_id = ?
    `);
    const members = membersStmt.all(row.id) as any[];

    const memberIds = members.map(m => m.user_id);
    const adminIds = members.filter(m => m.is_admin === 1).map(m => m.user_id);

    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      logo: row.logo,
      website: row.website,
      adminIds,
      memberIds,
      settings: JSON.parse(row.settings),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
