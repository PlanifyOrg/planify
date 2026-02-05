/**
 * Task model representing a task within an event
 */
export interface Task {
  id: string;
  eventId: string;
  title: string;
  description: string;
  assignedTo: string[]; // Array of user IDs
  volunteers: string[]; // Users who volunteered for this task
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  phase: TaskPhase; // Current phase/column in Kanban board
  tags: string[]; // Tags for categorization
  estimatedHours?: number;
  actualHours?: number;
  notes: TaskNote[]; // Comments/notes on the task
  attachments: TaskAttachment[];
  createdBy: string; // User ID who created the task
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  order: number; // For ordering within a phase
}

export interface TaskNote {
  id: string;
  taskId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPhase {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  DONE = 'done',
}

export interface CreateTaskDto {
  eventId: string;
  title: string;
  description: string;
  assignedTo?: string[];
  dueDate?: Date;
  priority: TaskPriority;
  phase?: TaskPhase;
  tags?: string[];
  estimatedHours?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedTo?: string[];
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  phase?: TaskPhase;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  order?: number;
}

export interface VolunteerTaskDto {
  taskId: string;
  userId: string;
}

export interface AddTaskNoteDto {
  taskId: string;
  userId: string;
  content: string;
}
