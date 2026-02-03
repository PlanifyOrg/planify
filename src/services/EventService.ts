/**
 * EventService handles event-related business logic
 */
import { Event, CreateEventDto, UpdateEventDto, EventStatus } from '../models/Event';
import { db } from '../utils/database';

export class EventService {
  /**
   * Create a new event
   */
  public createEvent(organizerId: string, eventData: CreateEventDto): Event {
    const eventId = this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO events (id, title, description, organizer_id, start_date, end_date, location, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      eventId,
      eventData.title,
      eventData.description,
      organizerId,
      eventData.startDate.toISOString(),
      eventData.endDate.toISOString(),
      eventData.location,
      EventStatus.DRAFT,
      now,
      now
    );

    // Add organizer as first participant
    const participantStmt = db.prepare(`
      INSERT INTO event_participants (event_id, user_id)
      VALUES (?, ?)
    `);
    participantStmt.run(eventId, organizerId);

    const event: Event = {
      id: eventId,
      title: eventData.title,
      description: eventData.description,
      organizerId,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      location: eventData.location,
      status: EventStatus.DRAFT,
      participants: [organizerId],
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    return event;
  }

  /**
   * Get event by ID
   */
  public getEventById(eventId: string): Event | undefined {
    const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const row = stmt.get(eventId) as any;

    if (!row) {
      return undefined;
    }

    // Get participants
    const participantsStmt = db.prepare('SELECT user_id FROM event_participants WHERE event_id = ?');
    const participants = participantsStmt.all(eventId) as any[];

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      organizerId: row.organizer_id,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      location: row.location,
      status: row.status as EventStatus,
      participants: participants.map(p => p.user_id),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Get all events for a user
   */
  public getEventsByUserId(userId: string): Event[] {
    const stmt = db.prepare(`
      SELECT DISTINCT e.* FROM events e
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      WHERE e.organizer_id = ? OR ep.user_id = ?
    `);
    const rows = stmt.all(userId, userId) as any[];

    return rows.map(row => {
      const participantsStmt = db.prepare('SELECT user_id FROM event_participants WHERE event_id = ?');
      const participants = participantsStmt.all(row.id) as any[];

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        organizerId: row.organizer_id,
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        location: row.location,
        status: row.status as EventStatus,
        participants: participants.map(p => p.user_id),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    });
  }

  /**
   * Update an event
   */
  public updateEvent(
    eventId: string,
    updateData: UpdateEventDto
  ): Event | null {
    const event = this.getEventById(eventId);
    if (!event) {
      return null;
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
    if (updateData.startDate !== undefined) {
      updates.push('start_date = ?');
      values.push(updateData.startDate.toISOString());
    }
    if (updateData.endDate !== undefined) {
      updates.push('end_date = ?');
      values.push(updateData.endDate.toISOString());
    }
    if (updateData.location !== undefined) {
      updates.push('location = ?');
      values.push(updateData.location);
    }
    if (updateData.status !== undefined) {
      updates.push('status = ?');
      values.push(updateData.status);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(eventId);

    const stmt = db.prepare(`
      UPDATE events SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.getEventById(eventId) || null;
  }

  /**
   * Add participant to event
   */
  public addParticipant(eventId: string, userId: string): boolean {
    try {
      const stmt = db.prepare(`
        INSERT INTO event_participants (event_id, user_id)
        VALUES (?, ?)
      `);
      stmt.run(eventId, userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove participant from event
   */
  public removeParticipant(eventId: string, userId: string): boolean {
    const stmt = db.prepare(`
      DELETE FROM event_participants WHERE event_id = ? AND user_id = ?
    `);
    const result = stmt.run(eventId, userId);
    return result.changes > 0;
  }

  /**
   * Delete an event
   */
  public deleteEvent(eventId: string): boolean {
    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(eventId);
    return result.changes > 0;
  }

  private generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
