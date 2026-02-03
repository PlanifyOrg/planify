/**
 * NotificationController handles notification-related HTTP requests
 */
import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { CreateNotificationDto } from '../models/Notification';

export class NotificationController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Create a new notification
   * POST /api/notifications
   */
  public createNotification = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const notificationData: CreateNotificationDto = req.body;

      if (!notificationData.recipientId || !notificationData.message) {
        res.status(400).json({
          success: false,
          message: 'recipientId and message are required',
        });
        return;
      }

      const notification =
        this.notificationService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get notifications for a user
   * GET /api/notifications/user/:userId
   */
  public getNotificationsByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const notifications =
        this.notificationService.getNotificationsByUserId(userId);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  public markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = this.notificationService.markAsRead(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Mark all notifications as read for a user
   * PUT /api/notifications/user/:userId/read-all
   */
  public markAllAsRead = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const count = this.notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
