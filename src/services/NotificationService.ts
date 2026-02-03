/**
 * NotificationService handles notification management
 */
import {
  Notification,
  CreateNotificationDto,
  NotificationType,
} from '../models/Notification';

export class NotificationService {
  private notifications: Map<string, Notification> = new Map();

  /**
   * Create a new notification
   */
  public createNotification(
    notificationData: CreateNotificationDto
  ): Notification {
    const notificationId = this.generateId();
    const notification: Notification = {
      id: notificationId,
      recipientId: notificationData.recipientId,
      senderId: notificationData.senderId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedEntityId: notificationData.relatedEntityId,
      isRead: false,
      createdAt: new Date(),
    };

    this.notifications.set(notificationId, notification);
    return notification;
  }

  /**
   * Get notifications for a user
   */
  public getNotificationsByUserId(userId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.recipientId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    notification.isRead = true;
    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  public markAllAsRead(userId: string): number {
    let count = 0;
    this.notifications.forEach((notification) => {
      if (notification.recipientId === userId && !notification.isRead) {
        notification.isRead = true;
        count++;
      }
    });
    return count;
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
