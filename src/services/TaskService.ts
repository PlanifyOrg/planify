/**
 * Task service handling all task-related business logic
 */
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskPhase,
  TaskStatus,
  TaskPriority,
  TaskNote,
  AddTaskNoteDto,
  VolunteerTaskDto,
} from '../models/Task';
import { getDatabase } from '../utils/database';

export class TaskService {
  private db = getDatabase();

  /**
   * Create a new task
   */
  createTask(data: CreateTaskDto, createdBy: string): Task {
    const task: Task = {
      id: uuidv4(),
      eventId: data.eventId,
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo || [],
      volunteers: [],
      dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      priority: data.priority,
      status: TaskStatus.TODO,
      phase: data.phase || TaskPhase.TODO,
      tags: data.tags || [],
      estimatedHours: data.estimatedHours,
      notes: [],
      attachments: [],
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: this.getNextOrderInPhase(data.eventId, data.phase || TaskPhase.TODO),
    };

    // Store task
    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, eventId, title, description, assignedTo, volunteers, dueDate, 
        priority, status, phase, tags, estimatedHours, actualHours,
        createdBy, createdAt, updatedAt, completedAt, "order"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.eventId,
      task.title,
      task.description,
      JSON.stringify(task.assignedTo),
      JSON.stringify(task.volunteers),
      task.dueDate.toISOString(),
      task.priority,
      task.status,
      task.phase,
      JSON.stringify(task.tags),
      task.estimatedHours || null,
      task.actualHours || null,
      task.createdBy,
      task.createdAt.toISOString(),
      task.updatedAt.toISOString(),
      task.completedAt?.toISOString() || null,
      task.order
    );

    return task;
  }

  /**
   * Get task by ID
   */
  getTaskById(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToTask(row) : null;
  }

  /**
   * Get all tasks for an event
   */
  getTasksByEventId(eventId: string): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE eventId = ? ORDER BY "order" ASC');
    const rows = stmt.all(eventId) as any[];
    return rows.map(row => this.mapRowToTask(row));
  }

  /**
   * Get tasks by user ID (assigned to or created by)
   */
  getTasksByUserId(userId: string): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE createdBy = ?');
    const rows = stmt.all(userId) as any[];
    const tasks = rows.map(row => this.mapRowToTask(row));
    
    // Also include tasks where user is assigned or volunteered
    return tasks.filter(task => 
      task.createdBy === userId || 
      task.assignedTo.includes(userId) || 
      task.volunteers.includes(userId)
    );
  }

  /**
   * Get tasks by phase for a specific event
   */
  getTasksByPhase(eventId: string, phase: TaskPhase): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE eventId = ? AND phase = ? ORDER BY "order" ASC');
    const rows = stmt.all(eventId, phase) as any[];
    return rows.map(row => this.mapRowToTask(row));
  }

  /**
   * Update task
   */
  updateTask(id: string, data: UpdateTaskDto): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const updatedTask: Task = {
      ...task,
      ...data,
      updatedAt: new Date(),
    };

    // If status changes to DONE, set completedAt
    if (data.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      updatedTask.completedAt = new Date();
    }

    const stmt = this.db.prepare(`
      UPDATE tasks SET
        title = ?, description = ?, assignedTo = ?, dueDate = ?,
        priority = ?, status = ?, phase = ?, tags = ?,
        estimatedHours = ?, actualHours = ?, updatedAt = ?,
        completedAt = ?, "order" = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedTask.title,
      updatedTask.description,
      JSON.stringify(updatedTask.assignedTo),
      updatedTask.dueDate.toISOString(),
      updatedTask.priority,
      updatedTask.status,
      updatedTask.phase,
      JSON.stringify(updatedTask.tags),
      updatedTask.estimatedHours || null,
      updatedTask.actualHours || null,
      updatedTask.updatedAt.toISOString(),
      updatedTask.completedAt?.toISOString() || null,
      updatedTask.order,
      id
    );

    return updatedTask;
  }

  /**
   * Move task to a different phase
   */
  moveTaskToPhase(id: string, newPhase: TaskPhase, newOrder?: number): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const order = newOrder !== undefined ? newOrder : this.getNextOrderInPhase(task.eventId, newPhase);

    // Update status based on phase
    let status = task.status;
    if (newPhase === TaskPhase.DONE) status = TaskStatus.DONE;
    else if (newPhase === TaskPhase.IN_PROGRESS) status = TaskStatus.IN_PROGRESS;
    else if (newPhase === TaskPhase.REVIEW) status = TaskStatus.REVIEW;
    else if (newPhase === TaskPhase.TODO || newPhase === TaskPhase.BACKLOG) status = TaskStatus.TODO;

    return this.updateTask(id, { phase: newPhase, order, status });
  }

  /**
   * Add a user as assigned to task
   */
  assignUser(taskId: string, userId: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    if (!task.assignedTo.includes(userId)) {
      task.assignedTo.push(userId);
      return this.updateTask(taskId, { assignedTo: task.assignedTo });
    }

    return task;
  }

  /**
   * Remove user from assigned
   */
  unassignUser(taskId: string, userId: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    task.assignedTo = task.assignedTo.filter(id => id !== userId);
    return this.updateTask(taskId, { assignedTo: task.assignedTo });
  }

  /**
   * Volunteer for a task
   */
  volunteerForTask(data: VolunteerTaskDto): Task | null {
    const task = this.getTaskById(data.taskId);
    if (!task) return null;

    if (!task.volunteers.includes(data.userId)) {
      task.volunteers.push(data.userId);
      
      const stmt = this.db.prepare('UPDATE tasks SET volunteers = ?, updatedAt = ? WHERE id = ?');
      stmt.run(
        JSON.stringify(task.volunteers),
        new Date().toISOString(),
        data.taskId
      );
    }

    return this.getTaskById(data.taskId);
  }

  /**
   * Remove volunteer from task
   */
  removeVolunteer(taskId: string, userId: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    task.volunteers = task.volunteers.filter(id => id !== userId);
    
    const stmt = this.db.prepare('UPDATE tasks SET volunteers = ?, updatedAt = ? WHERE id = ?');
    stmt.run(
      JSON.stringify(task.volunteers),
      new Date().toISOString(),
      taskId
    );

    return this.getTaskById(taskId);
  }

  /**
   * Add note to task
   */
  addNote(data: AddTaskNoteDto, username: string): TaskNote | null {
    const task = this.getTaskById(data.taskId);
    if (!task) return null;

    const note: TaskNote = {
      id: uuidv4(),
      taskId: data.taskId,
      userId: data.userId,
      username,
      content: data.content,
      createdAt: new Date(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO task_notes (id, taskId, userId, username, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      note.id,
      note.taskId,
      note.userId,
      note.username,
      note.content,
      note.createdAt.toISOString()
    );

    // Update task updatedAt
    this.db.prepare('UPDATE tasks SET updatedAt = ? WHERE id = ?')
      .run(new Date().toISOString(), data.taskId);

    return note;
  }

  /**
   * Get notes for a task
   */
  getTaskNotes(taskId: string): TaskNote[] {
    const stmt = this.db.prepare('SELECT * FROM task_notes WHERE taskId = ? ORDER BY createdAt DESC');
    const rows = stmt.all(taskId) as any[];
    return rows.map(row => ({
      id: row.id,
      taskId: row.taskId,
      userId: row.userId,
      username: row.username,
      content: row.content,
      createdAt: new Date(row.createdAt),
    }));
  }

  /**
   * Delete task
   */
  deleteTask(id: string): boolean {
    // Delete notes first
    this.db.prepare('DELETE FROM task_notes WHERE taskId = ?').run(id);
    
    // Delete task
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Helper: Get next order number for a phase
   */
  private getNextOrderInPhase(eventId: string, phase: TaskPhase): number {
    const stmt = this.db.prepare('SELECT MAX("order") as maxOrder FROM tasks WHERE eventId = ? AND phase = ?');
    const row = stmt.get(eventId, phase) as any;
    return (row?.maxOrder || 0) + 1;
  }

  /**
   * Helper: Map database row to Task object
   */
  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      eventId: row.eventId,
      title: row.title,
      description: row.description,
      assignedTo: JSON.parse(row.assignedTo || '[]'),
      volunteers: JSON.parse(row.volunteers || '[]'),
      dueDate: new Date(row.dueDate),
      priority: row.priority,
      status: row.status,
      phase: row.phase,
      tags: JSON.parse(row.tags || '[]'),
      estimatedHours: row.estimatedHours,
      actualHours: row.actualHours,
      notes: this.getTaskNotes(row.id),
      attachments: [],
      createdBy: row.createdBy,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      order: row.order,
    };
  }
}
