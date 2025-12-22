import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NoteService } from './note.service';
import {
  CommonSwaggerGetNoAuth,
  CommonSwaggerPostWithAuth,
} from 'src/common/decorators/common-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Notes')
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @CommonSwaggerPostWithAuth({
    summary: 'Create a new note (public)',
    description: '',
  })
  create(@Request() req, @Body() body: CreateNoteDto) {
    console.log(req.user);

    // return this.noteService.create({
    //   ...body,
    //   userId: req.user.userId,
    // });

    return this.noteService.create({
      ...body,
      user: { connect: { id: req.user.userId } },
    });
  }

  @CommonSwaggerGetNoAuth({
    summary: 'Get all notes (public)',
    description: 'Fetch all notes from the database .',
  })
  @Get()
  findAll() {
    return this.noteService.findAll();
  }

  @CommonSwaggerGetNoAuth({
    summary: 'Get one note (public)',
    description: 'Retrieve a single note by its ID.',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noteService.findOne(id);
  }

  @CommonSwaggerPostWithAuth({
    summary: 'Update note (public)',
    description: 'Edit a note by ID .',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: UpdateNoteDto) {
    return this.noteService.update(id, req.user.id, body);
  }

  @CommonSwaggerPostWithAuth({
    summary: 'Delete note (public)',
    description: 'Delete a note by its ID .',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.noteService.remove(id, req.user.id);
  }
}
