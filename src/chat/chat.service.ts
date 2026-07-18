import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface ChatMessage {
  message: string;
  from: unknown;
  createdAt: string;
}

@Injectable()
export class ChatService {
  private readonly CHAT_KEY = 'chat:messages';

  constructor(private readonly redisService: RedisService) { }

  async addMessage(message: ChatMessage) {
    await this.redisService.redis.rpush(
      this.CHAT_KEY,
      JSON.stringify(message),
    );
  }

  async getMessages(): Promise<ChatMessage[]> {
    const messages = await this.redisService.redis.lrange(
      this.CHAT_KEY,
      0,
      -1,
    );

    return messages.map((m) => JSON.parse(m));
  }
}
