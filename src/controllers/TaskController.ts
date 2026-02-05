/**
 * Task controller handling HTTP requests for tasks
 */
import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { AuthService } from '../services/AuthService';
import { NotificationService } from '../services/NotificationService';
import { CreateTaskDto, UpdateTaskDto, TaskPhase } from '../models/Task';

export class TaskController {
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  /**
   * Create a new task
   */
  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateTaskDto = req.body;
      const createdBy = req.body.createdBy;

      if (!data.title || !data.eventId || !createdBy) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
        return;
      }

      const task = this.taskService.createTask(data, createdBy);

      // Notify assigned users
      if (data.assignedTo && data.assignedTo.length > 0) {
        const creator = this.authService.getUserById(createdBy);
        for (const userId of data.assignedTo) {
          if (userId !== createdBy) {
            this.notificationService.createNotification({
              userId,
              type: 'task_assigned',
              title: 'New Task Assignment',
              message: `${creator?.username || 'Someone'} assigned you to task: ${task.title}`,
              relatedEntityId: task.id,
              relatedEntityType: 'task',
            });
          }
        }
      }

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create task',
      });
    }
  };

  /**
   * Get task by ID
   */
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const task = this.taskService.getTaskById(id);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error getting task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get task',
      });
    }
  };

  /**
   * Get tasks by event ID
   */
  getTasksByEventId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId } = req.params;
      const tasks = this.taskService.getTasksByEventId(eventId);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tasks',
      });
    }
  };

  /**
   * Get tasks by user ID
   */
  getTasksByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const tasks = this.taskService.getTasksByUserId(userId);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tasks',
      });
    }
  };

  /**
   * Update task
   */
  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateTaskDto = req.body;

      const task = this.taskService.updateTask(id, data);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update task',
      });
    }
  };

  /**
   * Move task to different phase
   */
  moveTaskToPhase = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { phase, order } = req.body;

      if (!phase) {
        res.status(400).json({
          success: false,
          message: 'Phase is required',
        });
        return;
      }

      const task = this.taskService.moveTaskToPhase(id, phase as TaskPhase, order);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error moving task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to move task',
      });
    }
  };

  /**
   * Assign user to task
   */
  assignUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, assignedBy } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const task = this.taskService.assignUser(id, userId);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      // Send notification
      if (assignedBy && userId !== assignedBy) {
        const assigner = this.authService.getUserById(assignedBy);
        this.notificationService.createNotification({
          userId,
          type: 'task_assigned',
          title: 'Task Assignment',
          message: `${assigner?.username || 'Someone'} assigned you to: ${task.title}`,
          relatedEntityId: task.id,
          relatedEntityType: 'task',
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error assigning user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign user',
      });
    }
  };

  /**
   * Unassign user from task
   */
  unassignUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, userId } = req.params;

      const task = this.taskService.unassignUser(id, userId);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error unassigning user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unassign user',
      });
    }
  };

  /**
   * Volunteer for task
   */
  volunteerForTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const task = this.taskService.volunteerForTask({ taskId: id, userId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      // Notify task creator
      const volunteer = this.authService.getUserById(userId);
      if (task.createdBy !== userId) {
        this.notificationService.createNotification({
          userId: task.createdBy,
          type: 'task_volunteer',
          title: 'New Task Volunteer',
          message: `${volunteer?.username || 'Someone'} volunteered for: ${task.title}`,
          relatedEntityId: task.id,
          relatedEntityType: 'task',
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error volunteering for task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to volunteer for task',
      });
    }
  };

  /**
   * Remove volunteer from task
   */
  removeVolunteer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, userId } = req.params;

      const task = this.taskService.removeVolunteer(id, userId);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error('Error removing volunteer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove volunteer',
      });
    }
  };

  /**
   * Add note to task
   */
  addNote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, content } = req.body;

      if (!userId || !content) {
        res.status(400).json({
          success: false,
          message: 'User ID and content are required',
        });
        return;
      }

      const user = this.authService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const note = this.taskService.addNote(
        { taskId: id, userId, content },
        user.username
      );

      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add note',
      });
    }
  };

  /**
   * Get task notes
   */
  getTaskNotes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notes = this.taskService.getTaskNotes(id);

      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      console.error('Error getting notes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notes',
      });
    }
  };

  /**
   * Delete task
   */
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = this.taskService.deleteTask(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete task',
      });
    }
  };
}
