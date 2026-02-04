import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  defaultOrganizationSettings,
} from '../models/Organization';
import { database } from '../utils/database';

/**
 * Service for managing organizations
 */
export class OrganizationService {
  /**
   * Create a new organization
   */
  public createOrganization(
    creatorId: string,
    orgData: CreateOrganizationDto
  ): Organization {
    const now = Date.now();
    const organization: Organization = {
      id: `org_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name: orgData.name,
      description: orgData.description,
      logo: orgData.logo,
      website: orgData.website,
      adminIds: [creatorId],
      memberIds: [creatorId],
      settings: {
        ...defaultOrganizationSettings,
        ...orgData.settings,
      },
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    database.organizations.push(organization);
    return organization;
  }

  /**
   * Get organization by ID
   */
  public getOrganizationById(id: string): Organization | undefined {
    return database.organizations.find((org) => org.id === id);
  }

  /**
   * Get all organizations
   */
  public getAllOrganizations(): Organization[] {
    return database.organizations;
  }

  /**
   * Get organizations where user is a member
   */
  public getOrganizationsByUserId(userId: string): Organization[] {
    return database.organizations.filter((org) =>
      org.memberIds.includes(userId)
    );
  }

  /**
   * Update an organization
   */
  public updateOrganization(
    id: string,
    updateData: UpdateOrganizationDto
  ): Organization | undefined {
    const org = database.organizations.find((o) => o.id === id);
    if (!org) {
      return undefined;
    }

    if (updateData.name) org.name = updateData.name;
    if (updateData.description) org.description = updateData.description;
    if (updateData.logo !== undefined) org.logo = updateData.logo;
    if (updateData.website !== undefined) org.website = updateData.website;
    if (updateData.settings) {
      org.settings = { ...org.settings, ...updateData.settings };
    }

    org.updatedAt = new Date();
    return org;
  }

  /**
   * Delete an organization
   */
  public deleteOrganization(id: string): boolean {
    const index = database.organizations.findIndex((org) => org.id === id);
    if (index === -1) {
      return false;
    }

    database.organizations.splice(index, 1);
    return true;
  }

  /**
   * Add a member to an organization
   */
  public addMember(orgId: string, userId: string): boolean {
    const org = database.organizations.find((o) => o.id === orgId);
    if (!org) {
      return false;
    }

    if (!org.memberIds.includes(userId)) {
      org.memberIds.push(userId);
      org.updatedAt = new Date();
    }

    return true;
  }

  /**
   * Remove a member from an organization
   */
  public removeMember(orgId: string, userId: string): boolean {
    const org = database.organizations.find((o) => o.id === orgId);
    if (!org) {
      return false;
    }

    const memberIndex = org.memberIds.indexOf(userId);
    if (memberIndex > -1) {
      org.memberIds.splice(memberIndex, 1);
      org.updatedAt = new Date();
    }

    // Also remove from admins if they were an admin
    const adminIndex = org.adminIds.indexOf(userId);
    if (adminIndex > -1) {
      org.adminIds.splice(adminIndex, 1);
    }

    return true;
  }

  /**
   * Add an admin to an organization
   */
  public addAdmin(orgId: string, userId: string): boolean {
    const org = database.organizations.find((o) => o.id === orgId);
    if (!org) {
      return false;
    }

    // Ensure user is a member first
    if (!org.memberIds.includes(userId)) {
      org.memberIds.push(userId);
    }

    // Add to admins
    if (!org.adminIds.includes(userId)) {
      org.adminIds.push(userId);
      org.updatedAt = new Date();
    }

    return true;
  }

  /**
   * Remove an admin from an organization
   */
  public removeAdmin(orgId: string, userId: string): boolean {
    const org = database.organizations.find((o) => o.id === orgId);
    if (!org) {
      return false;
    }

    const adminIndex = org.adminIds.indexOf(userId);
    if (adminIndex > -1) {
      org.adminIds.splice(adminIndex, 1);
      org.updatedAt = new Date();
    }

    return true;
  }

  /**
   * Check if user is an admin of the organization
   */
  public isAdmin(orgId: string, userId: string): boolean {
    const org = database.organizations.find((o) => o.id === orgId);
    if (!org) {
      return false;
    }

    return org.adminIds.includes(userId);
  }

  /**
   * Check if user is a member of the organization
   */
  public isMember(orgId: string, userId: string): boolean {
    const org = database.organizations.find((o) => o.id === orgId);
    if (!org) {
      return false;
    }

    return org.memberIds.includes(userId);
  }
}
