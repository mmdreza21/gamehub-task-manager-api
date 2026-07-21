import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Task, Priority, Status } from '@prisma/client';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'doneAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedTaskResponse {
  data: Task[];
  items: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) { }

  private buildWhere(filters?: TaskFilters): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status as Status;
    }

    if (filters?.priority && filters.priority !== 'all') {
      where.priority = filters.priority as Priority;
    }

    if (filters?.assigneeId && filters.assigneeId !== 'all') {
      where.assigneeId = filters.assigneeId;
    }

    const search = filters?.search?.trim();

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          desc: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private async findTask(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getAllTasks(filters?: TaskFilters): Promise<PaginatedTaskResponse> {
    const where = this.buildWhere(filters);

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const sortBy = filters?.sortBy ?? 'createdAt';
    const sortOrder = filters?.sortOrder ?? 'desc';

    const totalItems = await this.prisma.task.count({
      where,
    });

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      data: tasks,
      items: totalItems,
      page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getUserTasks(
    userId: string,
    filters?: TaskFilters,
  ): Promise<PaginatedTaskResponse> {
    const where = this.buildWhere(filters);

    where.assigneeId = userId;

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const sortBy = filters?.sortBy ?? 'createdAt';
    const sortOrder = filters?.sortOrder ?? 'desc';

    const totalItems = await this.prisma.task.count({
      where,
    });

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      data: tasks,
      items: totalItems,
      page,
      totalPages: Math.ceil(totalItems / limit),
    };
  } async getTaskById(id: string, userId: string): Promise<Task> {
    const task = await this.findTask(id);

    if (
      task.creatorId !== userId &&
      task.assigneeId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async createTask(
    data: CreateTaskDto,
    creatorId: string,
  ): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        desc: data.desc ?? '',
        priority: data.priority ?? Priority.LOW,
        status: data.status ?? Status.Todo,
        creatorId,
        assigneeId: data.assigneeId,
      },
    });
  }

  async updateTask(
    id: string,
    data: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findTask(id);

    // Only the creator can edit task details
    if (task.assigneeId !== userId && task.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this task',
      );
    }

    const updateData: Prisma.TaskUpdateInput = {
      ...data,
    };

    if (data.status !== undefined) {
      updateData.doneAt =
        data.status === Status.Done ? new Date() : null;
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteTask(
    id: string,
    userId: string,
  ): Promise<Task> {
    const task = await this.findTask(id);

    // Only the creator can delete the task
    if (task.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this task',
      );
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }

  async updateUserTaskStatus(
    userId: string,
    taskId: string,
    status: Status,
  ): Promise<Task> {
    const task = await this.findTask(taskId);

    // Only the assignee can change the status
    if (task.assigneeId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this task status',
      );
    }

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
        doneAt: status === Status.Done ? new Date() : null,
      },
    });
  }
}