import { ApiProperty } from '@nestjs/swagger';

export class StreamAgentDto {
  @ApiProperty({
    example: 'Translate this sentence to Persian',
  })
  task: string;
}
