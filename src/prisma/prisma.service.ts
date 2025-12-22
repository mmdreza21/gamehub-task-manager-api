import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

export const extendedPrismaClient = new PrismaClient().$extends(pagination());
export type ExtendedPrismaClient = typeof extendedPrismaClient;

// process.env.DATABASE_URL =
//   process.env.NODE_ENV === 'test'
//     ? process.env.DATABASE_URL_TEST
//     : process.env.NODE_ENV === 'production'
//       ? process.env.DATABASE_URL_PROD
//       : process.env.DATABASE_URL_DEV;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
      return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
    }
  }
}
