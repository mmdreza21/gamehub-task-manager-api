import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, Status } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({
    example: 'My New Task',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Task description',
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiPropertyOptional({
    enum: Priority,
    default: Priority.LOW,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    enum: Status,
    default: Status.Todo,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({
    description: 'User who will be assigned this task',
    example: 'clx9u9q9c0000abc123xyz456',
  })
  @IsString() // use IsUUID only if your IDs are UUIDs. Prisma cuid() is NOT UUID.
  @IsNotEmpty()
  assigneeId: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Updated Task',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiPropertyOptional({
    enum: Priority,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    enum: Status,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}

export class ChangeStatusDto {
  @ApiProperty({
    enum: Status,
    example: Status.Doing,
  })
  @IsEnum(Status)
  status: Status;
}