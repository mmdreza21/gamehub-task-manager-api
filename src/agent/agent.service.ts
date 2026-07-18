import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { StreamAgentDto } from './dto/stream-agent.dto';
import { AgentStreamResponseDto } from './dto/agent-stream-response.dto';

@Injectable()
export class AgentService {
  async run(dto: StreamAgentDto): Promise<AgentStreamResponseDto> {
    const llm = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      maxRetries: 2,
    });

    const result = await llm.invoke([
      {
        role: 'system',
        content:
          'You are a helpful assistant that translates English to Persian.',
      },
      {
        role: 'user',
        content: dto.task,
      },
    ]);

    return { data: result.text };
  }

  async stream(onToken: (chunk: string) => void, task: string): Promise<void> {
    const llm = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
    });

    const stream = await llm.stream([
      {
        role: 'user',
        content: task,
      },
    ]);

    for await (const chunk of stream) {
      if (!chunk?.content) continue;
      onToken(chunk.content.toString());
    }
  }
}
