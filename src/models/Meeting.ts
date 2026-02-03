/**
 * Meeting model representing a meeting within an event
 */
export interface Meeting {
  id: string;
  eventId: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number; // in minutes
  participants: string[]; // Array of user IDs
  status: MeetingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum MeetingStatus {
  PROPOSED = 'proposed',
  CONFIRMED = 'confirmed',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CreateMeetingDto {
  eventId: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number;
  participants: string[];
}
