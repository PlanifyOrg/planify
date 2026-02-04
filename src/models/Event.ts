/**
 * Event model representing an event in the system
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizationId?: string; // Optional: Organization this event belongs to
  startDate: Date;
  endDate: Date;
  location: string;
  status: EventStatus;
  participants: string[]; // Array of user IDs
  createdAt: Date;
  updatedAt: Date;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CreateEventDto {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  status?: EventStatus;
}
