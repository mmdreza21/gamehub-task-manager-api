import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.redis_host || 'redis',
            port: process.env.redis_port ? parseInt(process.env.redis_port) : 6379,
        });
    }

    get redis() {
        return this.client;
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}