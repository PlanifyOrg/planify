/**
 * EventService handles event-related business logic
 */
import { Event, CreateEventDto, UpdateEventDto, EventStatus } from '../models/Event';

export class EventService {
  private events: Map<string, Event> = new Map();

  /**
   * Create a new event
   */
  public createEvent(organizerId: string, eventData: CreateEventDto): Event {
    const eventId = this.generateId();
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.events.set(eventId, event);
    return event;
  }

  /**
   * Get event by ID
   */
  public getEventById(eventId: string): Event | undefined {
    return this.events.get(eventId);
  }

  /**
   * Get all events for a user
   */
  public getEventsByUserId(userId: string): Event[] {
    return Array.from(this.events.values()).filter(
      (event) =>
        event.organizerId === userId || event.participants.includes(userId)
    );
  }

  /**
   * Update an event
   */
  public updateEvent(
    eventId: string,
    updateData: UpdateEventDto
  ): Event | null {
    const event = this.events.get(eventId);
    if (!event) {
      return null;
    }

    const updatedEvent: Event = {
      ...event,
      ...updateData,
      updatedAt: new Date(),
    };

    this.events.set(eventId, updatedEvent);
    return updatedEvent;
  }

  /**
   * Add participant to event
   */
  public addParticipant(eventId: string, userId: string): boolean {
    const event = this.events.get(eventId);
    if (!event || event.participants.includes(userId)) {
      return false;
    }

    event.participants.push(userId);
    event.updatedAt = new Date();
    return true;
  }

  /**
   * Remove participant from event
   */
  public removeParticipant(eventId: string, userId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) {
      return false;
    }

    const index = event.participants.indexOf(userId);
    if (index === -1) {
      return false;
    }

    event.participants.splice(index, 1);
    event.updatedAt = new Date();
    return true;
  }

  /**
   * Delete an event
   */
  public deleteEvent(eventId: string): boolean {
    return this.events.delete(eventId);
  }

  private generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
