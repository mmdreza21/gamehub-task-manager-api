import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Task } from '@prisma/client';
import {
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskService } from './task.service';
import {
  ChangeStatusDto,
  CreateTaskDto,
  UpdateTaskDto,
} from './dto/create-task.dto';

@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Get('all')
  @ApiOperation({
    summary: 'Get all tasks with filters and pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['Todo', 'Doing', 'ToReview', 'Done', 'Canceled', 'all'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'all'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'doneAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
  })
  @ApiQuery({
    name: 'AssigneeId',
    required: false,
    enum: ['asc', 'desc'],
  })
  async getAllTasks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,

    @Query('status')
    status?: string,

    @Query('priority')
    priority?: string,

    @Query('search')
    search?: string,

    @Query('assigneeId')
    assigneeId?: string,

    @Query('sortBy')
    sortBy?: 'createdAt' | 'updatedAt' | 'doneAt',

    @Query('sortOrder')
    sortOrder?: 'asc' | 'desc',
  ) {
    return this.taskService.getAllTasks({
      page,
      limit,
      status,
      priority,
      search,
      assigneeId,
      sortBy: sortBy ?? 'createdAt',
      sortOrder: sortOrder ?? 'desc',
    });
  }

  @Get()
  @ApiOperation({
    summary: "Get current user's assigned tasks",
  })
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['Todo', 'Doing', 'ToReview', 'Done', 'Canceled', 'all'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'all'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'doneAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
  })
  async getTasks(
    @Request() req,

    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,

    @Query('status')
    status?: string,

    @Query('priority')
    priority?: string,

    @Query('search')
    search?: string,

    @Query('sortBy')
    sortBy?: 'createdAt' | 'updatedAt' | 'doneAt',

    @Query('sortOrder')
    sortOrder?: 'asc' | 'desc',
  ) {
    return this.taskService.getUserTasks(req.user.userId, {
      page,
      limit,
      status,
      priority,
      search,
      sortBy: sortBy ?? 'createdAt',
      sortOrder: sortOrder ?? 'desc',
    });
  } @Get(':id')
  @ApiOperation({
    summary: 'Get task by id',
  })
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getTaskById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<Task> {
    return this.taskService.getTaskById(
      id,
      req.user.userId,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new task',
  })
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async createTask(
    @Request() req,
    @Body() body: CreateTaskDto,
  ): Promise<Task> {
    return this.taskService.createTask(
      body,
      req.user.userId,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update task',
  })
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Request() req,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.updateTask(
      id,
      body,
      req.user.userId,
    );
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update task status',
  })
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async updateTaskStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: ChangeStatusDto,
  ): Promise<Task> {
    return this.taskService.updateUserTaskStatus(
      req.user.userId,
      id,
      body.status,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete task',
  })
  @ApiSecurity('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async deleteTask(
    @Request() req,
    @Param('id') id: string,
  ): Promise<Task> {
    return this.taskService.deleteTask(
      id,
      req.user.userId,
    );
  }
}