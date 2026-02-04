/**
 * Express server setup with REST API endpoints
 */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuthService } from './services/AuthService';
import { EventService } from './services/EventService';
import { NotificationService } from './services/NotificationService';
import { MeetingService } from './services/MeetingService';
import { OrganizationService } from './services/OrganizationService';
import { AuthController } from './controllers/AuthController';
import { EventController } from './controllers/EventController';
import { NotificationController } from './controllers/NotificationController';
import { MeetingController } from './controllers/MeetingController';
import { OrganizationController } from './controllers/OrganizationController';
import { JoinRequestController } from './controllers/JoinRequestController';
import { initializeDatabase } from './utils/database';

// Load environment variables
dotenv.config();

// Initialize database
initializeDatabase();

// Initialize services
const authService = new AuthService();
const eventService = new EventService();
const notificationService = new NotificationService();
const meetingService = new MeetingService();
const organizationService = new OrganizationService();

// Initialize controllers
const authController = new AuthController(authService);
const eventController = new EventController(eventService);
const notificationController = new NotificationController(notificationService);
const meetingController = new MeetingController(meetingService, organizationService);
const organizationController = new OrganizationController(organizationService);

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
app.delete('/api/events/:id/participants/:userId', eventController.removeParticipant);
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

// Meeting routes
app.post('/api/meetings', meetingController.createMeeting);
app.get('/api/meetings/:id', meetingController.getMeetingById);
app.get('/api/meetings/event/:eventId', meetingController.getMeetingsByEventId);
app.put('/api/meetings/:id', meetingController.updateMeeting);
app.delete('/api/meetings/:id', meetingController.deleteMeeting);
app.post('/api/meetings/:id/participants', meetingController.addParticipant);
app.delete('/api/meetings/:id/participants/:userId', meetingController.removeParticipant);
app.post('/api/meetings/:id/checkin', meetingController.checkInParticipant);
app.post('/api/meetings/:id/flag', meetingController.flagMeeting);
app.post('/api/meetings/:id/unflag', meetingController.unflagMeeting);
app.post('/api/meetings/:id/agenda', meetingController.addAgendaItem);
app.put('/api/meetings/agenda/:agendaItemId/complete', meetingController.completeAgendaItem);
app.post('/api/meetings/:id/documents', meetingController.addDocument);
app.put('/api/meetings/documents/:documentId', meetingController.updateDocument);

// Organization routes
app.post('/api/organizations', organizationController.createOrganization);
app.get('/api/organizations', organizationController.getAllOrganizations);
app.get('/api/organizations/:id', organizationController.getOrganizationById);
app.get('/api/organizations/user/:userId', organizationController.getOrganizationsByUserId);
app.put('/api/organizations/:id', organizationController.updateOrganization);
app.delete('/api/organizations/:id', organizationController.deleteOrganization);
app.post('/api/organizations/:id/members', organizationController.addMember);
app.delete('/api/organizations/:id/members/:userId', organizationController.removeMember);
app.post('/api/organizations/:id/admins', organizationController.addAdmin);
app.delete('/api/organizations/:id/admins/:userId', organizationController.removeAdmin);

// Join request routes
app.post('/api/organizations/:organizationId/join-requests', JoinRequestController.createJoinRequest);
app.get('/api/organizations/:organizationId/join-requests', JoinRequestController.getPendingRequests);
app.post('/api/join-requests/:requestId/approve', JoinRequestController.approveJoinRequest);
app.post('/api/join-requests/:requestId/reject', JoinRequestController.rejectJoinRequest);

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
  console.log('  POST   /api/meetings');
  console.log('  GET    /api/meetings/:id');
  console.log('  GET    /api/meetings/event/:eventId');
  console.log('  POST   /api/meetings/:id/checkin');
  console.log('  POST   /api/meetings/:id/agenda');
  console.log('  POST   /api/meetings/:id/documents');
  console.log('  POST   /api/notifications');
  console.log('  GET    /api/notifications/user/:userId');
  console.log('  POST   /api/organizations');
  console.log('  GET    /api/organizations');
  console.log('  GET    /api/organizations/:id');
  console.log('  GET    /api/organizations/user/:userId');
  console.log('========================================\n');
});

export default app;
