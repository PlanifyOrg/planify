/**
 * MeetingService handles meeting-related business logic
 */
import {
  Meeting,
  CreateMeetingDto,
  UpdateMeetingDto,
  MeetingStatus,
  AgendaItem,
  MeetingDocument,
  CreateAgendaItemDto,
  CreateDocumentDto,
  MeetingParticipant,
} from '../models/Meeting';
import { db } from '../utils/database';

export class MeetingService {
  /**
   * Create a new meeting with optional agenda items
   */
  public createMeeting(meetingData: CreateMeetingDto): Meeting {
    const meetingId = this.generateId();
    const now = new Date().toISOString();

    // Insert meeting
    const stmt = db.prepare(`
      INSERT INTO meetings (id, event_id, title, description, scheduled_time, duration, meeting_link, created_by, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      meetingId,
      meetingData.eventId || null, // Allow null for independent meetings
      meetingData.title,
      meetingData.description,
      meetingData.scheduledTime.toISOString(),
      meetingData.duration,
      meetingData.meetingLink || null,
      meetingData.createdBy,
      MeetingStatus.PROPOSED,
      now,
      now
    );

    // Add participants (including creator if not already in list)
    const participantStmt = db.prepare(`
      INSERT INTO meeting_participants (meeting_id, user_id)
      VALUES (?, ?)
    `);

    // Ensure creator is always a participant
    const allParticipants = new Set([meetingData.createdBy, ...meetingData.participants]);
    
    allParticipants.forEach((userId) => {
      participantStmt.run(meetingId, userId);
    });

    // Add agenda items if provided
    if (meetingData.agendaItems && meetingData.agendaItems.length > 0) {
      const agendaStmt = db.prepare(`
        INSERT INTO meeting_agenda_items (id, meeting_id, title, description, duration, order_index)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      meetingData.agendaItems.forEach((item) => {
        agendaStmt.run(
          this.generateAgendaId(),
          meetingId,
          item.title,
          item.description || null,
          item.duration || null,
          item.orderIndex
        );
      });
    }

    return this.getMeetingById(meetingId)!;
  }

  /**
   * Get meeting by ID with all related data
   */
  public getMeetingById(meetingId: string): Meeting | undefined {
    const stmt = db.prepare('SELECT * FROM meetings WHERE id = ?');
    const row = stmt.get(meetingId) as any;

    if (!row) {
      return undefined;
    }

    // Get participants with check-in status and usernames
    const participantsStmt = db.prepare(`
      SELECT mp.user_id, mp.checked_in, mp.checked_in_at, u.username
      FROM meeting_participants mp
      LEFT JOIN users u ON mp.user_id = u.id
      WHERE mp.meeting_id = ?
    `);
    const participantRows = participantsStmt.all(meetingId) as any[];
    const participants: MeetingParticipant[] = participantRows.map(p => ({
      userId: p.user_id,
      username: p.username || 'Unknown User',
      checkedIn: p.checked_in === 1,
      checkedInAt: p.checked_in_at ? new Date(p.checked_in_at) : undefined,
    }));

    // Get agenda items
    const agendaStmt = db.prepare(`
      SELECT * FROM meeting_agenda_items 
      WHERE meeting_id = ? 
      ORDER BY order_index
    `);
    const agendaRows = agendaStmt.all(meetingId) as any[];
    const agendaItems: AgendaItem[] = agendaRows.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      duration: a.duration,
      orderIndex: a.order_index,
      isCompleted: a.is_completed === 1,
    }));

    // Get documents
    const documentsStmt = db.prepare(`
      SELECT md.*, u.username as created_by_username
      FROM meeting_documents md
      LEFT JOIN users u ON md.created_by = u.id
      WHERE md.meeting_id = ? 
      ORDER BY md.created_at DESC
    `);
    const documentRows = documentsStmt.all(meetingId) as any[];
    const documents: MeetingDocument[] = documentRows.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      type: d.type,
      createdBy: d.created_by,
      createdByUsername: d.created_by_username || 'Unknown User',
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));

    // Get flaggedBy username if meeting is flagged
    let flaggedByUsername: string | undefined = undefined;
    if (row.flagged_by) {
      const userStmt = db.prepare('SELECT username FROM users WHERE id = ?');
      const userRow = userStmt.get(row.flagged_by) as any;
      flaggedByUsername = userRow?.username || 'Unknown User';
    }

    // Get createdBy username
    let createdByUsername: string | undefined = undefined;
    if (row.created_by) {
      const creatorStmt = db.prepare('SELECT username FROM users WHERE id = ?');
      const creatorRow = creatorStmt.get(row.created_by) as any;
      createdByUsername = creatorRow?.username || 'Unknown User';
    }

    return {
      id: row.id,
      eventId: row.event_id,
      title: row.title,
      description: row.description,
      scheduledTime: new Date(row.scheduled_time),
      duration: row.duration,
      meetingLink: row.meeting_link || undefined,
      createdBy: row.created_by || '',
      createdByUsername,
      participants,
      agendaItems,
      documents,
      status: row.status as MeetingStatus,
      flaggedForDeletion: row.flagged_for_deletion === 1,
      flaggedBy: row.flagged_by || undefined,
      flaggedByUsername,
      flaggedAt: row.flagged_at ? new Date(row.flagged_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Get all meetings for an event
   */
  public getMeetingsByEventId(eventId: string): Meeting[] {
    const stmt = db.prepare('SELECT id FROM meetings WHERE event_id = ? ORDER BY scheduled_time');
    const rows = stmt.all(eventId) as any[];
    
    return rows.map(row => this.getMeetingById(row.id)!).filter(m => m !== undefined);
  }

  /**
   * Get all meetings for a user (by meeting participation, not just event participation)
   */
  public getMeetingsByUserId(userId: string): Meeting[] {
    const stmt = db.prepare(`
      SELECT DISTINCT m.id 
      FROM meetings m
      INNER JOIN meeting_participants mp ON m.id = mp.meeting_id
      WHERE mp.user_id = ?
      ORDER BY m.scheduled_time
    `);
    const rows = stmt.all(userId) as any[];
    
    return rows.map(row => this.getMeetingById(row.id)!).filter(m => m !== undefined);
  }

  /**
   * Get all meetings in the system (for admins)
   */
  public getAllMeetings(): Meeting[] {
    const stmt = db.prepare('SELECT id FROM meetings ORDER BY scheduled_time');
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.getMeetingById(row.id)!).filter(m => m !== undefined);
  }

  /**
   * Update meeting details
   */
  public updateMeeting(meetingId: string, updateData: UpdateMeetingDto): Meeting | undefined {
    const existing = this.getMeetingById(meetingId);
    if (!existing) {
      return undefined;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.title !== undefined) {
      updates.push('title = ?');
      values.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      updates.push('description = ?');
      values.push(updateData.description);
    }
    if (updateData.scheduledTime !== undefined) {
      updates.push('scheduled_time = ?');
      values.push(updateData.scheduledTime.toISOString());
    }
    if (updateData.duration !== undefined) {
      updates.push('duration = ?');
      values.push(updateData.duration);
    }
    if (updateData.meetingLink !== undefined) {
      updates.push('meeting_link = ?');
      values.push(updateData.meetingLink || null);
    }
    if (updateData.status !== undefined) {
      updates.push('status = ?');
      values.push(updateData.status);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(meetingId);

    const stmt = db.prepare(`
      UPDATE meetings SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.getMeetingById(meetingId);
  }

  /**
   * Add participant to meeting
   */
  public addParticipant(meetingId: string, userId: string): boolean {
    try {
      const stmt = db.prepare(`
        INSERT INTO meeting_participants (meeting_id, user_id)
        VALUES (?, ?)
      `);
      stmt.run(meetingId, userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check in a participant
   */
  public checkInParticipant(meetingId: string, userId: string): boolean {
    // First check if participant exists and is not already checked in
    const checkStmt = db.prepare(`
      SELECT checked_in FROM meeting_participants 
      WHERE meeting_id = ? AND user_id = ?
    `);
    const participant = checkStmt.get(meetingId, userId) as any;
    
    if (!participant) {
      return false; // Participant not found
    }
    
    if (participant.checked_in === 1) {
      return false; // Already checked in
    }
    
    // Now update the check-in status
    const stmt = db.prepare(`
      UPDATE meeting_participants 
      SET checked_in = 1, checked_in_at = ?
      WHERE meeting_id = ? AND user_id = ?
    `);
    const result = stmt.run(new Date().toISOString(), meetingId, userId);
    return result.changes > 0;
  }

  /**
   * Remove participant from meeting
   */
  public removeParticipant(meetingId: string, userId: string): boolean {
    try {
      const stmt = db.prepare(`
        DELETE FROM meeting_participants
        WHERE meeting_id = ? AND user_id = ?
      `);
      const result = stmt.run(meetingId, userId);
      return result.changes > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add agenda item to meeting
   */
  public addAgendaItem(meetingId: string, agendaItem: CreateAgendaItemDto): AgendaItem {
    const agendaId = this.generateAgendaId();
    const stmt = db.prepare(`
      INSERT INTO meeting_agenda_items (id, meeting_id, title, description, duration, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      agendaId,
      meetingId,
      agendaItem.title,
      agendaItem.description || null,
      agendaItem.duration || null,
      agendaItem.orderIndex
    );

    return {
      id: agendaId,
      title: agendaItem.title,
      description: agendaItem.description,
      duration: agendaItem.duration,
      orderIndex: agendaItem.orderIndex,
      isCompleted: false,
    };
  }

  /**
   * Mark agenda item as completed
   */
  public completeAgendaItem(agendaItemId: string): boolean {
    const stmt = db.prepare(`
      UPDATE meeting_agenda_items 
      SET is_completed = 1 
      WHERE id = ?
    `);
    const result = stmt.run(agendaItemId);
    return result.changes > 0;
  }

  /**
   * Add document to meeting
   */
  public addDocument(meetingId: string, document: CreateDocumentDto): MeetingDocument {
    const documentId = this.generateDocumentId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO meeting_documents (id, meeting_id, title, content, type, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      documentId,
      meetingId,
      document.title,
      document.content,
      document.type,
      document.createdBy,
      now,
      now
    );

    return {
      id: documentId,
      title: document.title,
      content: document.content,
      type: document.type,
      createdBy: document.createdBy,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  /**
   * Update document content
   */
  public updateDocument(documentId: string, content: string): boolean {
    const stmt = db.prepare(`
      UPDATE meeting_documents 
      SET content = ?, updated_at = ?
      WHERE id = ?
    `);
    const result = stmt.run(content, new Date().toISOString(), documentId);
    return result.changes > 0;
  }

  /**
   * Flag meeting for deletion
   */
  public flagMeetingForDeletion(meetingId: string, userId: string): boolean {
    const stmt = db.prepare(`
      UPDATE meetings 
      SET flagged_for_deletion = 1, flagged_by = ?, flagged_at = ?, updated_at = ?
      WHERE id = ?
    `);
    const now = new Date().toISOString();
    const result = stmt.run(userId, now, now, meetingId);
    return result.changes > 0;
  }

  /**
   * Unflag meeting for deletion
   */
  public unflagMeetingForDeletion(meetingId: string): boolean {
    const stmt = db.prepare(`
      UPDATE meetings 
      SET flagged_for_deletion = 0, flagged_by = NULL, flagged_at = NULL, updated_at = ?
      WHERE id = ?
    `);
    const result = stmt.run(new Date().toISOString(), meetingId);
    return result.changes > 0;
  }

  /**
   * Delete meeting (admin only - should be checked in controller)
   */
  public deleteMeeting(meetingId: string): boolean {
    const stmt = db.prepare('DELETE FROM meetings WHERE id = ?');
    const result = stmt.run(meetingId);
    return result.changes > 0;
  }

  private generateId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateAgendaId(): string {
    return `agenda_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateDocumentId(): string {
    return `document_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
