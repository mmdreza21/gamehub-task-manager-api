import { ApiProperty } from '@nestjs/swagger';

export class AgentStreamResponseDto {
  @ApiProperty({
    example: 'سلام',
    description: 'Single streamed token/chunk from AI',
  })
  data: string;
}
