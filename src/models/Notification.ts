/**
 * Notification model representing a notification in the system
 */
export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string; // ID of related event, meeting, or task
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  EVENT_INVITATION = 'event_invitation',
  EVENT_UPDATE = 'event_update',
  MEETING_SCHEDULED = 'meeting_scheduled',
  MEETING_REMINDER = 'meeting_reminder',
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE_SOON = 'task_due_soon',
  PARTICIPANT_REQUEST = 'participant_request',
  GENERAL = 'general',
}

export interface CreateNotificationDto {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
}
