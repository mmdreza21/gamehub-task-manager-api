import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../taskEntity';

export class CreateTaskDto {
  @ApiProperty({ example: 'My New Task' })
  title: string;

  @ApiProperty({ example: 'Task description', required: false })
  desc?: string;

  @ApiProperty({ example: 1, required: false })
  priority?: number;

  @ApiProperty({
    example: 'Todo',
    enum: ['Todo', 'Doing', 'ToReview', 'Done', 'Canceled'],
    required: false,
  })
  status?: Status;
}

export class ChangeStatusDto {
  @ApiProperty({
    example: 'Todo',
    enum: ['Todo', 'Doing', 'ToReview', 'Done', 'Canceled'],
    required: false,
  })
  status?: Status;
}
