/**
 * EventController handles event-related HTTP requests
 */
import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { CreateEventDto, UpdateEventDto } from '../models/Event';

export class EventController {
  private eventService: EventService;

  constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  /**
   * Create a new event
   * POST /api/events
   */
  public createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventData: CreateEventDto = req.body;
      const { organizerId } = req.body;

      if (!organizerId) {
        res.status(400).json({
          success: false,
          message: 'organizerId is required',
        });
        return;
      }

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
      const updateData: UpdateEventDto = req.body;

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
