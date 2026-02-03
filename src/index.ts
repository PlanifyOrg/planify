/**
 * Main application entry point
 */
import { AuthService } from './services/AuthService';
import { EventService } from './services/EventService';
import { NotificationService } from './services/NotificationService';

class PlanifyApp {
  private authService: AuthService;
  private eventService: EventService;
  private notificationService: NotificationService;

  constructor() {
    this.authService = new AuthService();
    this.eventService = new EventService();
    this.notificationService = new NotificationService();
  }

  public async initialize(): Promise<void> {
    console.log('Planify Application Starting...');
    console.log('==============================');
    console.log('Event Planning & Management System');
    console.log('Version: 0.1.0');
    console.log('==============================');
    
    // Initialize services
    console.log('✓ Auth Service initialized');
    console.log('✓ Event Service initialized');
    console.log('✓ Notification Service initialized');
    
    console.log('\nApplication ready!');
  }

  public getAuthService(): AuthService {
    return this.authService;
  }

  public getEventService(): EventService {
    return this.eventService;
  }

  public getNotificationService(): NotificationService {
    return this.notificationService;
  }
}

// Initialize and start the application
const app = new PlanifyApp();
app
  .initialize()
  .then(() => {
    console.log('\nPlanify is running successfully!');
  })
  .catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });

export default app;
