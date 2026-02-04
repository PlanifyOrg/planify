/**
 * Organization model representing a company/group in the system
 * Provides multi-tenancy support for user and event management
 */
export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  adminIds: string[]; // Array of user IDs who are admins
  memberIds: string[]; // Array of all member user IDs
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  allowMemberCreateEvents: boolean;
  allowMemberInviteUsers: boolean;
  requireEventApproval: boolean;
  maxEventsPerMonth?: number;
  timezone: string;
}

export interface CreateOrganizationDto {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  settings?: Partial<OrganizationSettings>;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  settings?: Partial<OrganizationSettings>;
}

export const defaultOrganizationSettings: OrganizationSettings = {
  allowMemberCreateEvents: true,
  allowMemberInviteUsers: false,
  requireEventApproval: false,
  timezone: 'UTC',
};
