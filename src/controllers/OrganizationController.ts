import { Request, Response } from 'express';
import { OrganizationService } from '../services/OrganizationService';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../models/Organization';

/**
 * Controller for handling organization-related requests
 */
export class OrganizationController {
  private organizationService: OrganizationService;

  constructor(organizationService: OrganizationService) {
    this.organizationService = organizationService;
  }

  /**
   * Create a new organization
   * POST /api/organizations
   */
  public createOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { creatorId, name, description, logo, website, settings } = req.body;

      if (!creatorId || !name) {
        res.status(400).json({
          success: false,
          message: 'creatorId and name are required',
        });
        return;
      }

      const orgData: CreateOrganizationDto = {
        name,
        description: description || '',
        logo,
        website,
        settings,
      };

      const organization = this.organizationService.createOrganization(creatorId, orgData);

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: organization,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create organization',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get organization by ID
   * GET /api/organizations/:id
   */
  public getOrganizationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organization = this.organizationService.getOrganizationById(id);

      if (!organization) {
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: organization,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch organization',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get all organizations
   * GET /api/organizations
   */
  public getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizations = this.organizationService.getAllOrganizations();

      res.status(200).json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch organizations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get organizations for a user
   * GET /api/organizations/user/:userId
   */
  public getOrganizationsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const organizations = this.organizationService.getOrganizationsByUserId(userId);

      res.status(200).json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch organizations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update an organization
   * PUT /api/organizations/:id
   */
  public updateOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateOrganizationDto = req.body;

      const organization = this.organizationService.updateOrganization(id, updateData);

      if (!organization) {
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Organization updated successfully',
        data: organization,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update organization',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete an organization
   * DELETE /api/organizations/:id
   */
  public deleteOrganization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = this.organizationService.deleteOrganization(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete organization',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add a member to an organization
   * POST /api/organizations/:id/members
   */
  public addMember = async (req: Request, res: Response): Promise<void> => {
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

      const success = this.organizationService.addMember(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Member added successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add member',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Remove a member from an organization
   * DELETE /api/organizations/:id/members/:userId
   */
  public removeMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, userId } = req.params;

      const success = this.organizationService.removeMember(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove member',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Add an admin to an organization
   * POST /api/organizations/:id/admins
   */
  public addAdmin = async (req: Request, res: Response): Promise<void> => {
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

      const success = this.organizationService.addAdmin(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin added successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add admin',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Remove an admin from an organization
   * DELETE /api/organizations/:id/admins/:userId
   */
  public removeAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, userId } = req.params;

      const success = this.organizationService.removeAdmin(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin removed successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove admin',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
