/**
 * Sample test file for AuthService
 */
import { AuthService } from '../src/services/AuthService';
import { UserRole } from '../src/models/User';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test('should register a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await authService.register(userData);

    expect(user).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(UserRole.PARTICIPANT);
  });

  test('should login a user with correct credentials', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    await authService.register(userData);
    const loggedInUser = await authService.login(
      userData.username,
      userData.password
    );

    expect(loggedInUser).toBeDefined();
    expect(loggedInUser?.username).toBe(userData.username);
  });

  test('should not login a user with incorrect credentials', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    await authService.register(userData);
    const loggedInUser = await authService.login(
      userData.username,
      'wrongpassword'
    );

    expect(loggedInUser).toBeNull();
  });
});
