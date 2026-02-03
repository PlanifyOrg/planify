/**
 * User model representing a user in the system
 */
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  PARTICIPANT = 'participant',
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}
