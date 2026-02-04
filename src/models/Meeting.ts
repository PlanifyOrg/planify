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
  meetingLink?: string; // Video conference link (Zoom, Teams, BBB, etc.)
  createdBy: string; // User ID of meeting creator
  createdByUsername?: string;
  participants: MeetingParticipant[];
  agendaItems: AgendaItem[];
  documents: MeetingDocument[];
  status: MeetingStatus;
  flaggedForDeletion: boolean;
  flaggedBy?: string;
  flaggedByUsername?: string;
  flaggedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingParticipant {
  userId: string;
  username?: string;
  checkedIn: boolean;
  checkedInAt?: Date;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration?: number; // in minutes
  orderIndex: number;
  isCompleted: boolean;
}

export interface MeetingDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  createdBy: string;
  createdByUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  NOTES = 'notes',
  MINUTES = 'minutes',
  AGENDA = 'agenda',
  ATTACHMENT = 'attachment',
  PROTOCOL = 'protocol',
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
  meetingLink?: string;
  createdBy: string;
  participants: string[];
  agendaItems?: CreateAgendaItemDto[];
}

export interface CreateAgendaItemDto {
  title: string;
  description?: string;
  duration?: number;
  orderIndex: number;
}

export interface CreateDocumentDto {
  title: string;
  content: string;
  type: DocumentType;
  createdBy: string;
}

export interface UpdateMeetingDto {
  title?: string;
  description?: string;
  scheduledTime?: Date;
  duration?: number;
  meetingLink?: string;
  status?: MeetingStatus;
}
