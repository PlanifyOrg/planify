/**
 * Express server setup with REST API endpoints
 */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuthService } from './services/AuthService';
import { EventService } from './services/EventService';
import { NotificationService } from './services/NotificationService';
import { AuthController } from './controllers/AuthController';
import { EventController } from './controllers/EventController';
import { NotificationController } from './controllers/NotificationController';

// Load environment variables
dotenv.config();

// Initialize services
const authService = new AuthService();
const eventService = new EventService();
const notificationService = new NotificationService();

// Initialize controllers
const authController = new AuthController(authService);
const eventController = new EventController(eventService);
const notificationController = new NotificationController(notificationService);

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Planify API is running',
    version: '0.1.0',
  });
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/user/:id', authController.getUserById);

// Event routes
app.post('/api/events', eventController.createEvent);
app.get('/api/events/:id', eventController.getEventById);
app.get('/api/events/user/:userId', eventController.getEventsByUserId);
app.put('/api/events/:id', eventController.updateEvent);
app.post('/api/events/:id/participants', eventController.addParticipant);
app.delete('/api/events/:id', eventController.deleteEvent);

// Notification routes
app.post('/api/notifications', notificationController.createNotification);
app.get(
  '/api/notifications/user/:userId',
  notificationController.getNotificationsByUserId
);
app.put('/api/notifications/:id/read', notificationController.markAsRead);
app.put(
  '/api/notifications/user/:userId/read-all',
  notificationController.markAllAsRead
);

// 404 handler for API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('   PLANIFY SERVER STARTED! ✓');
  console.log('========================================');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📄 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log('========================================\n');
  console.log('Available endpoints:');
  console.log('  GET    /api/health');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/user/:id');
  console.log('  POST   /api/events');
  console.log('  GET    /api/events/:id');
  console.log('  GET    /api/events/user/:userId');
  console.log('  PUT    /api/events/:id');
  console.log('  DELETE /api/events/:id');
  console.log('  POST   /api/notifications');
  console.log('  GET    /api/notifications/user/:userId');
  console.log('========================================\n');
});

export default app;
