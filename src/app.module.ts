import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { NoteModule } from './note/note.module';
import { AgentModule } from './agent/agent.module';
import { GamesModule } from './games/games.module';
import { GenreModule } from './genre/genre.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'Public'),
      serveRoot: '/images',
    }),
    UsersModule,
    AuthModule,
    TaskModule,
    PrismaModule,
    MailModule,
    ChatModule,
    NoteModule,
    AgentModule,
    GamesModule,
    GenreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
