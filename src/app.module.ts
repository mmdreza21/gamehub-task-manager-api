import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { NoteModule } from './note/note.module';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [UsersModule, AuthModule, TaskModule, PrismaModule, MailModule, ChatModule, NoteModule, AgentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
