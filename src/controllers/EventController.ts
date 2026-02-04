/**
 * EventController handles event-related HTTP requests
 */
import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { CreateEventDto, UpdateEventDto } from '../models/Event';
import { NotificationService } from '../services/NotificationService';
import { AuthService } from '../services/AuthService';
import { NotificationType } from '../models/Notification';

export class EventController {
  private eventService: EventService;
  private notificationService: NotificationService;
  private authService: AuthService;

  constructor(
    eventService: EventService,
    notificationService: NotificationService,
    authService: AuthService
  ) {
    this.eventService = eventService;
    this.notificationService = notificationService;
    this.authService = authService;
  }

  /**
   * Create a new event
   * POST /api/events
   */
  public createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizerId, title, description, startDate, endDate, location } = req.body;

      if (!organizerId) {
        res.status(400).json({
          success: false,
          message: 'organizerId is required',
        });
        return;
      }

      if (!title || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'title, startDate, and endDate are required',
        });
        return;
      }

      const eventData: CreateEventDto = {
        title,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || '',
      };

      const event = this.eventService.createEvent(organizerId, eventData);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get event by ID
   * GET /api/events/:id
   */
  public getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const event = this.eventService.getEventById(id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get all events for a user
   * GET /api/events/user/:userId
   */
  public getEventsByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const events = this.eventService.getEventsByUserId(userId);

      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update an event
   * PUT /api/events/:id
   */
  public updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateEventDto = {};

      // Convert date strings to Date objects if provided
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.location) updateData.location = req.body.location;
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
      if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);

      const event = this.eventService.updateEvent(id, updateData);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update event',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add participant to event
   * POST /api/events/:id/participants
   */
  public addParticipant = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId is required',
        });
        return;
      }

      const success = this.eventService.addParticipant(id, userId);

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Failed to add participant (event not found or already participant)',
        });
        return;
      }

      // Send notification to the added participant
      try {
        const event = this.eventService.getEventById(id);
        if (event) {
          const organizer = this.authService.getUserById(event.organizerId);
          const organizerName = organizer ? organizer.username : 'Someone';
          
          this.notificationService.createNotification({
            recipientId: userId,
            senderId: event.organizerId,
            type: NotificationType.EVENT_UPDATE,
            title: '📅 Added to Event',
            message: `${organizerName} added you as a participant to the event "${event.title}"`,
            relatedEntityId: id,
          });
        }
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Continue anyway - participant was added successfully
      }

      res.status(200).json({
        success: true,
        message: 'Participant added successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add participant',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Remove participant from event
   * DELETE /api/events/:id/participants/:userId
   */
  public removeParticipant = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id, userId } = req.params;

      const success = this.eventService.removeParticipant(id, userId);

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Failed to remove participant',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Participant removed successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove participant',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete an event
   * DELETE /api/events/:id
   */
  public deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = this.eventService.deleteEvent(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
