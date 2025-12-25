import { Controller, Sse, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AgentService } from './agent.service';

import { StreamAgentDto } from './dto/stream-agent.dto';
import { AgentStreamResponseDto } from './dto/agent-stream-response.dto';
import { Observable } from 'rxjs';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  // @Post()
  // @ApiResponse({ status: 200, type: RunResponseDto })
  // create(@Body() createAgentDto: CreateAgentDto): Promise<RunResponseDto> {
  //   return this.agentService.run(createAgentDto);
  // }

  @Sse('stream')
  @ApiQuery({ name: 'task', type: String })
  @ApiResponse({
    status: 200,
    description: 'AI streamed response (SSE)',
    type: AgentStreamResponseDto,
  })
  stream(@Query() query: StreamAgentDto): Observable<AgentStreamResponseDto> {
    return new Observable((subscriber) => {
      this.agentService
        .stream((token) => {
          subscriber.next({ data: token });
        }, query.task)
        .then(() => {
          subscriber.next({ data: '[DONE]' }); // ✅ signal end
          subscriber.complete();
        })
        .catch((err) => subscriber.error(err));
    });
  }
}
