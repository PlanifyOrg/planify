/**
 * Controller for handling join request-related HTTP requests
 */
import { Request, Response } from 'express';
import { JoinRequestService } from '../services/JoinRequestService';

export class JoinRequestController {
  /**
   * Create a new join request
   */
  static createJoinRequest(req: Request, res: Response): void {
    try {
      const { organizationId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const joinRequest = JoinRequestService.createJoinRequest(organizationId, userId);

      res.status(201).json({
        success: true,
        message: 'Join request created successfully',
        data: joinRequest,
      });
    } catch (error) {
      console.error('Create join request error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create join request',
      });
    }
  }

  /**
   * Get pending join requests for an organization
   */
  static getPendingRequests(req: Request, res: Response): void {
    try {
      const { organizationId } = req.params;
      const requests = JoinRequestService.getPendingRequestsForOrganization(organizationId);

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error('Get pending requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve join requests',
      });
    }
  }

  /**
   * Approve a join request
   */
  static approveJoinRequest(req: Request, res: Response): void {
    try {
      const { requestId } = req.params;
      const { reviewerId } = req.body;

      if (!reviewerId) {
        res.status(400).json({
          success: false,
          message: 'Reviewer ID is required',
        });
        return;
      }

      JoinRequestService.approveJoinRequest(requestId, reviewerId);

      res.json({
        success: true,
        message: 'Join request approved successfully',
      });
    } catch (error) {
      console.error('Approve join request error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve join request',
      });
    }
  }

  /**
   * Reject a join request
   */
  static rejectJoinRequest(req: Request, res: Response): void {
    try {
      const { requestId } = req.params;
      const { reviewerId } = req.body;

      if (!reviewerId) {
        res.status(400).json({
          success: false,
          message: 'Reviewer ID is required',
        });
        return;
      }

      JoinRequestService.rejectJoinRequest(requestId, reviewerId);

      res.json({
        success: true,
        message: 'Join request rejected successfully',
      });
    } catch (error) {
      console.error('Reject join request error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject join request',
      });
    }
  }
}
