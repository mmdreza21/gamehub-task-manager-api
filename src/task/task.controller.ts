import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiSecurity, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Task } from '@prisma/client';
import { ChangeStatusDto, CreateTaskDto } from './dto/taskdto';


@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }


  @Get('all')
  @ApiQuery({ name: 'priority', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'createdAt',
    required: false,
    type: String,
    example: '2025-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'doneAt',
    required: false,
    type: String,
    example: '2025-01-10T00:00:00.000Z',
  })
  async getAllTasks(
    @Query('priority') priority?: number,
    @Query('createdAt') createdAt?: string,
    @Query('doneAt') doneAt?: string,
  ): Promise<Task[]> {
    const filters = {
      priority: priority ? +priority : undefined,
      createdAt: createdAt ? this.formatDate(createdAt) : undefined,
      doneAt: doneAt ? this.formatDate(doneAt) : undefined,
    };

    return this.taskService.getAllTasks(filters);
  }
  @Get()
  @ApiQuery({ name: 'priority', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'createdAt',
    required: false,
    type: String,
    example: '2025-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'doneAt',
    required: false,
    type: String,
    example: '2025-01-10T00:00:00.000Z',
  })

  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getTasks(
    @Request() req,
    @Query('priority') priority?: number,
    @Query('createdAt') createdAt?: string,
    @Query('doneAt') doneAt?: string,
  ): Promise<Task[]> {
    const filters = {
      priority: priority ? +priority : undefined,
      createdAt: createdAt ? this.formatDate(createdAt) : undefined,
      doneAt: doneAt ? this.formatDate(doneAt) : undefined,
    };

    return this.taskService.getUserTasks(req.user.userId, filters);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Append a default time to ensure full ISO-8601 format
    return date.toISOString().slice(0, 10) + 'T00:00:00.000Z';
  }

  // Create a new task for the logged-in user
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'My New Task' },
        desc: { type: 'string', example: 'Task description', nullable: true },
        priority: { type: 'number', example: 1, nullable: true },
        status: {
          type: 'string',
          example: 'Todo',
          enum: ['Todo', 'Doing', 'ToReview', 'Done', 'Canceled'],
        },
      },
      required: ['title'],
    },
  })
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async createTask(
    @Request() req,
    @Body()
    body: CreateTaskDto,
  ): Promise<Task> {
    return this.taskService.createTask(body, req.user.userId);
  }

  // Update a task's status for the logged-in user
  @Patch(':id/status')
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async updateTaskStatus(
    @Request() req,
    @Body() body: ChangeStatusDto,
    @Param('id') id: string,
  ): Promise<Task> {
    return this.taskService.updateUserTaskStatus(
      req.user.userId,
      id,
      body.status,
    );
  }
}
