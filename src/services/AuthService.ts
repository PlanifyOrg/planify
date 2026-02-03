/**
 * AuthService handles user authentication and authorization
 */
import { User, CreateUserDto, UserRole } from '../models/User';

export class AuthService {
  private users: Map<string, User> = new Map();

  /**
   * Register a new user
   */
  public async register(userData: CreateUserDto): Promise<User> {
    const userId = this.generateId();
    const user: User = {
      id: userId,
      username: userData.username,
      email: userData.email,
      passwordHash: await this.hashPassword(userData.password),
      role: userData.role || UserRole.PARTICIPANT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(userId, user);
    return user;
  }

  /**
   * Login a user
   */
  public async login(username: string, password: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      (u) => u.username === username
    );

    if (!user) {
      return null;
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    return isValid ? user : null;
  }

  /**
   * Get user by ID
   */
  public getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Check if user has required role
   */
  public hasRole(user: User, requiredRole: UserRole): boolean {
    return user.role === requiredRole || user.role === UserRole.ADMIN;
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or similar
    return `hashed_${password}`;
  }

  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    // In production, use bcrypt or similar
    return hash === `hashed_${password}`;
  }
}
