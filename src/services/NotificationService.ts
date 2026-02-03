/**
 * NotificationService handles notification management
 */
import {
  Notification,
  CreateNotificationDto,
  NotificationType,
} from '../models/Notification';
import { db } from '../utils/database';

export class NotificationService {
  /**
   * Create a new notification
   */
  public createNotification(
    notificationData: CreateNotificationDto
  ): Notification {
    const notificationId = this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO notifications (id, recipient_id, sender_id, type, title, message, related_entity_id, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    stmt.run(
      notificationId,
      notificationData.recipientId,
      notificationData.senderId || null,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.relatedEntityId || null,
      now
    );

    return {
      id: notificationId,
      recipientId: notificationData.recipientId,
      senderId: notificationData.senderId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedEntityId: notificationData.relatedEntityId,
      isRead: false,
      createdAt: new Date(now),
    };
  }

  /**
   * Get notifications for a user
   */
  public getNotificationsByUserId(userId: string): Notification[] {
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE recipient_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) as any[];

    return rows.map(row => ({
      id: row.id,
      recipientId: row.recipient_id,
      senderId: row.sender_id,
      type: row.type as NotificationType,
      title: row.title,
      message: row.message,
      relatedEntityId: row.related_entity_id,
      isRead: row.is_read === 1,
      createdAt: new Date(row.created_at),
    }));
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): boolean {
    const stmt = db.prepare(`
      UPDATE notifications SET is_read = 1 WHERE id = ?
    `);
    const result = stmt.run(notificationId);
    return result.changes > 0;
  }

  /**
   * Mark all notifications as read for a user
   */
  public markAllAsRead(userId: string): number {
    const stmt = db.prepare(`
      UPDATE notifications SET is_read = 1
      WHERE recipient_id = ? AND is_read = 0
    `);
    const result = stmt.run(userId);
    return result.changes;
  }

  /**
   * Send event invitation notification
   */
  public sendEventInvitation(
    recipientId: string,
    senderId: string,
    eventId: string,
    eventTitle: string
  ): Notification {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.EVENT_INVITATION,
      title: 'Event Invitation',
      message: `You have been invited to ${eventTitle}`,
      relatedEntityId: eventId,
    });
  }

  /**
   * Send task assignment notification
   */
  public sendTaskAssignment(
    recipientId: string,
    taskId: string,
    taskTitle: string
  ): Notification {
    return this.createNotification({
      recipientId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task Assigned',
      message: `You have been assigned to task: ${taskTitle}`,
      relatedEntityId: taskId,
    });
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }
}
