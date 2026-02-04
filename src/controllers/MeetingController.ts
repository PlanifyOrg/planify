/**
 * MeetingController handles meeting-related HTTP requests
 */
import { Request, Response } from 'express';
import { MeetingService } from '../services/MeetingService';
import { OrganizationService } from '../services/OrganizationService';
import { NotificationService } from '../services/NotificationService';
import { EventService } from '../services/EventService';
import { AuthService } from '../services/AuthService';
import { NotificationType } from '../models/Notification';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  CreateAgendaItemDto,
  CreateDocumentDto,
} from '../models/Meeting';

export class MeetingController {
  private meetingService: MeetingService;
  private organizationService: OrganizationService;
  private notificationService: NotificationService;
  private eventService: EventService;
  private authService: AuthService;

  constructor(
    meetingService: MeetingService,
    organizationService: OrganizationService,
    notificationService: NotificationService,
    eventService: EventService,
    authService: AuthService
  ) {
    this.meetingService = meetingService;
    this.organizationService = organizationService;
    this.notificationService = notificationService;
    this.eventService = eventService;
    this.authService = authService;
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
        meetingLink,
        createdBy,
      } = req.body;

      if (!title || !scheduledTime || !duration || !createdBy) {
        res.status(400).json({
          success: false,
          message: 'title, scheduledTime, duration, and createdBy are required',
        });
        return;
      }

      const meetingData: CreateMeetingDto = {
        eventId,
        title,
        description: description || '',
        scheduledTime: new Date(scheduledTime),
        duration: Number(duration),
        meetingLink,
        createdBy,
        participants: participants || [],
        agendaItems: agendaItems || [],
      };

      const meeting = this.meetingService.createMeeting(meetingData);

      // Send notifications to all participants (except creator)
      try {
        const creator = this.authService.getUserById(createdBy);
        const creatorName = creator ? creator.username : 'Someone';
        
        meeting.participants.forEach(participant => {
          if (participant.userId !== createdBy) {
            this.notificationService.createNotification({
              recipientId: participant.userId,
              senderId: createdBy,
              type: NotificationType.MEETING_SCHEDULED,
              title: '📋 Meeting Invitation',
              message: `${creatorName} invited you to the meeting "${meeting.title}"`,
              relatedEntityId: meeting.id,
            });
          }
        });
      } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
        // Continue anyway - meeting was created successfully
      }

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
   * Get all meetings for a user (by meeting participation)
   * GET /api/meetings/user/:userId
   */
  public getMeetingsByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { includeAll } = req.query;

      // If includeAll is true, check if user is admin and return all meetings
      if (includeAll === 'true') {
        try {
          const orgResponse = await fetch(`http://localhost:3000/api/organizations/user/${userId}`);
          const orgData = await orgResponse.json() as any;
          
          if (orgData.success && orgData.data && orgData.data.length > 0) {
            const org = orgData.data[0];
            const isAdmin = org.adminIds.includes(userId);
            
            if (isAdmin) {
              // Return all meetings for admins
              const allMeetings = this.meetingService.getAllMeetings();
              res.status(200).json({
                success: true,
                data: allMeetings,
              });
              return;
            }
          }
        } catch (error) {
          console.error('Failed to check admin status:', error);
        }
      }

      // Return only meetings where user is a participant
      const meetings = this.meetingService.getMeetingsByUserId(userId);

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
      const { userId, requesterId } = req.body;

      if (!userId || !requesterId) {
        res.status(400).json({
          success: false,
          message: 'userId and requesterId are required',
        });
        return;
      }

      // Get the meeting to check creator
      const meeting = this.meetingService.getMeetingById(id);
      if (!meeting) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found',
        });
        return;
      }

      // Check if requester is the meeting creator
      const isCreator = meeting.createdBy === requesterId;

      // Check if requester is an admin (by checking their organization)
      let isAdmin = false;
      try {
        const orgResponse = await fetch(`http://localhost:3000/api/organizations/user/${requesterId}`);
        const orgData = await orgResponse.json() as any;
        if (orgData.success && orgData.data && orgData.data.length > 0) {
          const org = orgData.data[0];
          isAdmin = org.adminIds.includes(requesterId);
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }

      // Only allow creator or admin to add participants
      if (!isCreator && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Only the meeting creator or organization admins can add participants',
        });
        return;
      }

      const success = this.meetingService.addParticipant(id, userId);

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Failed to add participant (participant may already exist)',
        });
        return;
      }

      // Send notification to the added participant
      try {
        const adder = this.authService.getUserById(requesterId);
        const adderName = adder ? adder.username : 'Someone';
        
        this.notificationService.createNotification({
          recipientId: userId,
          senderId: requesterId,
          type: NotificationType.MEETING_SCHEDULED,
          title: '📋 Added to Meeting',
          message: `${adderName} added you as a participant to the meeting "${meeting.title}"`,
          relatedEntityId: id,
        });
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
   * Flag meeting for deletion
   * POST /api/meetings/:id/flag
   */
  public flagMeeting = async (req: Request, res: Response): Promise<void> => {
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

      const success = this.meetingService.flagMeetingForDeletion(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found',
        });
        return;
      }

      // Try to notify admins (don't fail if this doesn't work)
      try {
        const meeting = this.meetingService.getMeetingById(id);
        if (meeting && meeting.eventId) {
          const event = this.eventService.getEventById(meeting.eventId);
          if (event && event.organizationId) {
            const organization = this.organizationService.getOrganizationById(event.organizationId);
            if (organization) {
              const flagger = this.authService.getUserById(userId);
              const flaggerName = flagger ? flagger.username : 'A user';

              organization.adminIds.forEach((adminId) => {
                if (adminId !== userId) {
                  this.notificationService.createNotification({
                    recipientId: adminId,
                    senderId: userId,
                    type: NotificationType.MEETING_FLAGGED,
                    title: '🚩 Meeting Flagged for Deletion',
                    message: `${flaggerName} has flagged the meeting "${meeting.title}" for deletion. Please review.`,
                    relatedEntityId: id,
                  });
                }
              });
            }
          }
        }
      } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
        // Continue anyway - flagging succeeded
      }

      res.status(200).json({
        success: true,
        message: 'Meeting flagged for deletion',
      });
    } catch (error) {
      console.error('Flag meeting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to flag meeting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Unflag meeting for deletion
   * POST /api/meetings/:id/unflag
   */
  public unflagMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = this.meetingService.unflagMeetingForDeletion(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Meeting unflagged',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to unflag meeting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete meeting (admin only)
   * DELETE /api/meetings/:id
   */
  public deleteMeeting = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { requesterId } = req.body;

      if (!requesterId) {
        res.status(400).json({
          success: false,
          message: 'requesterId is required',
        });
        return;
      }

      // Get meeting to find organization
      const meeting = this.meetingService.getMeetingById(id);
      if (!meeting) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found',
        });
        return;
      }

      // Get event to find organization
      const eventStmt = require('../utils/database').db.prepare('SELECT organization_id FROM events WHERE id = ?');
      const event = eventStmt.get(meeting.eventId) as any;
      
      if (!event || !event.organization_id) {
        res.status(400).json({
          success: false,
          message: 'Event organization not found',
        });
        return;
      }

      // Check if requester is admin
      const isAdmin = this.organizationService.isAdmin(event.organization_id, requesterId);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Only admins can delete meetings',
        });
        return;
      }

      const success = this.meetingService.deleteMeeting(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Failed to delete meeting',
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
