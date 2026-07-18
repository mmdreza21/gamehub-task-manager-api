import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) { }

  // Create a new note
  // one way to do it
  // async create(data: Prisma.NoteUncheckedCreateInput) {
  //   return this.prisma.note.create({
  //     data,
  //   });
  // }

  async create(data: Prisma.NoteCreateInput) {
    return this.prisma.note.create({
      data,
    });
  }

  // Get all notes
  async findAll() {
    return this.prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get one note by ID
  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  // Update note by ID
  async update(
    id: string,
    userId: string,
    data: Partial<{ title: string; content: string }>,
  ) {
    // Find the note first
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    // Check if it exists and belongs to this user
    if (!note || note.userId !== userId) {
      throw new ForbiddenException('You are not allowed to edit this note');
    }

    // Proceed to update
    return this.prisma.note.update({
      where: { id },
      data,
    });
  }

  // Delete note by ID
  async remove(id: string, userId: string) {
    try {
      // Find the note first
      const note = await this.prisma.note.findUnique({
        where: { id },
      });

      if (note && note.userId !== userId) {
        throw new ForbiddenException('You are not allowed to delete this note');
      }

      return await this.prisma.note.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Note not found');
    }
  }
}
