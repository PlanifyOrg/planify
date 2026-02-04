/**
 * MeetingController handles meeting-related HTTP requests
 */
import { Request, Response } from 'express';
import { MeetingService } from '../services/MeetingService';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  CreateAgendaItemDto,
  CreateDocumentDto,
} from '../models/Meeting';

export class MeetingController {
  private meetingService: MeetingService;

  constructor(meetingService: MeetingService) {
    this.meetingService = meetingService;
  }

  /**
   * Create a new meeting
   * POST /api/meetings
   */
  public createMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        eventId,
        title,
        description,
        scheduledTime,
        duration,
        participants,
        agendaItems,
      } = req.body;

      if (!eventId || !title || !scheduledTime || !duration) {
        res.status(400).json({
          success: false,
          message: 'eventId, title, scheduledTime, and duration are required',
        });
        return;
      }

      const meetingData: CreateMeetingDto = {
        eventId,
        title,
        description: description || '',
        scheduledTime: new Date(scheduledTime),
        duration: Number(duration),
        participants: participants || [],
        agendaItems: agendaItems || [],
      };

      const meeting = this.meetingService.createMeeting(meetingData);

      res.status(201).json({
        success: true,
        message: 'Meeting created successfully',
        data: meeting,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create meeting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get meeting by ID
   * GET /api/meetings/:id
   */
  public getMeetingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const meeting = this.meetingService.getMeetingById(id);

      if (!meeting) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: meeting,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch meeting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get all meetings for an event
   * GET /api/meetings/event/:eventId
   */
  public getMeetingsByEventId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { eventId } = req.params;
      const meetings = this.meetingService.getMeetingsByEventId(eventId);

      res.status(200).json({
        success: true,
        data: meetings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch meetings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update meeting
   * PUT /api/meetings/:id
   */
  public updateMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateMeetingDto = {};

      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.scheduledTime) updateData.scheduledTime = new Date(req.body.scheduledTime);
      if (req.body.duration) updateData.duration = Number(req.body.duration);
      if (req.body.status) updateData.status = req.body.status;

      const meeting = this.meetingService.updateMeeting(id, updateData);

      if (!meeting) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Meeting updated successfully',
        data: meeting,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update meeting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add participant to meeting
   * POST /api/meetings/:id/participants
   */
  public addParticipant = async (req: Request, res: Response): Promise<void> => {
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

      const success = this.meetingService.addParticipant(id, userId);

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Failed to add participant',
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
   * Check in participant
   * POST /api/meetings/:id/checkin
   */
  public checkInParticipant = async (
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

      const success = this.meetingService.checkInParticipant(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Participant not found or already checked in',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Participant checked in successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check in participant',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add agenda item
   * POST /api/meetings/:id/agenda
   */
  public addAgendaItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, duration, orderIndex } = req.body;

      if (!title || orderIndex === undefined) {
        res.status(400).json({
          success: false,
          message: 'title and orderIndex are required',
        });
        return;
      }

      const agendaItem: CreateAgendaItemDto = {
        title,
        description,
        duration: duration ? Number(duration) : undefined,
        orderIndex: Number(orderIndex),
      };

      const createdItem = this.meetingService.addAgendaItem(id, agendaItem);

      res.status(201).json({
        success: true,
        message: 'Agenda item added successfully',
        data: createdItem,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add agenda item',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Complete agenda item
   * PUT /api/meetings/agenda/:agendaItemId/complete
   */
  public completeAgendaItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { agendaItemId } = req.params;
      const success = this.meetingService.completeAgendaItem(agendaItemId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Agenda item not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Agenda item marked as completed',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to complete agenda item',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add document to meeting
   * POST /api/meetings/:id/documents
   */
  public addDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content, type, createdBy } = req.body;

      if (!title || !content || !type || !createdBy) {
        res.status(400).json({
          success: false,
          message: 'title, content, type, and createdBy are required',
        });
        return;
      }

      const documentData: CreateDocumentDto = {
        title,
        content,
        type,
        createdBy,
      };

      const document = this.meetingService.addDocument(id, documentData);

      res.status(201).json({
        success: true,
        message: 'Document added successfully',
        data: document,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update document
   * PUT /api/meetings/documents/:documentId
   */
  public updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { documentId } = req.params;
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          message: 'content is required',
        });
        return;
      }

      const success = this.meetingService.updateDocument(documentId, content);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Document not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Remove participant from meeting
   * DELETE /api/meetings/:id/participants/:userId
   */
  public removeParticipant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, userId } = req.params;

      const success = this.meetingService.removeParticipant(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Participant not found',
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
   * Delete meeting
   * DELETE /api/meetings/:id
   */
  public deleteMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = this.meetingService.deleteMeeting(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Meeting deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete meeting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
