import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Task } from '@prisma/client';
import { Status } from './taskEntity';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) { }

  // List all tasks with optional filters
  async getAllTasks(
    filters?: {
      priority?: number;
      createdAt?: Date | string;
      doneAt?: Date | string;
    },
  ): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    // Handle priority filter
    if (filters?.priority !== undefined) {
      where.priority = filters.priority;
    }

    if (filters?.createdAt) {
      const startOfDay = new Date(filters.createdAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.createdAt);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (filters?.doneAt) {
      const startOfDay = new Date(filters.doneAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.doneAt);
      endOfDay.setHours(23, 59, 59, 999);

      where.doneAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.task.findMany({
      include: {
        User: true,
      },
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create a new task
  async createTask(data: Partial<Task>, userId: string): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        desc: data.desc || '',
        status: data.status || 'Todo',
        priority: data.priority || 0,
        userId,
        createdAt: new Date(),
      },
    });
  }

  async getUserTasks(
    userId: string,
    filters?: {
      priority?: number;
      createdAt?: Date | string;
      doneAt?: Date | string;
    },
  ): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = { userId };

    // Handle priority filter
    if (filters?.priority !== undefined) {
      where.priority = filters.priority;
    }

    if (filters?.createdAt) {
      const startOfDay = new Date(filters.createdAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.createdAt);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (filters?.doneAt) {
      const startOfDay = new Date(filters.doneAt);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.doneAt);
      endOfDay.setHours(23, 59, 59, 999);

      where.doneAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Change task status
  async updateUserTaskStatus(
    userId: string,
    taskId: string,
    status: Status,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new Error('Task not found or access denied');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        doneAt: status === 'Done' ? new Date() : null,
      },
    });
  }
}
