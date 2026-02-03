/**
 * Task model representing a task within an event
 */
export interface Task {
  id: string;
  eventId: string;
  title: string;
  description: string;
  assignedTo: string[]; // Array of user IDs
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
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

export interface CreateTaskDto {
  eventId: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: Date;
  priority: TaskPriority;
}
