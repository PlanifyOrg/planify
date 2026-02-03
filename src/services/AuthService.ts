/**
 * AuthService handles user authentication and authorization
 */
import { User, CreateUserDto, UserRole } from '../models/User';
import { db } from '../utils/database';

export class AuthService {
  /**
   * Register a new user
   */
  public async register(userData: CreateUserDto): Promise<User> {
    const userId = this.generateId();
    const passwordHash = await this.hashPassword(userData.password);
    const role = userData.role || UserRole.PARTICIPANT;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(userId, userData.username, userData.email, passwordHash, role, now, now);

    const user: User = {
      id: userId,
      username: userData.username,
      email: userData.email,
      passwordHash,
      role,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    return user;
  }

  /**
   * Login a user
   */
  public async login(username: string, password: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(username) as any;

    if (!row) {
      return null;
    }

    const isValid = await this.verifyPassword(password, row.password_hash);
    if (!isValid) {
      return null;
    }

    const user: User = {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role as UserRole,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return user;
  }

  /**
   * Get user by ID
   */
  public getUserById(userId: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(userId) as any;

    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role as UserRole,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
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
