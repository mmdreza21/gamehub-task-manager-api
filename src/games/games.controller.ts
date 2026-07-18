import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationOptionsDto } from './dto/pagination.dto';
import {
  CommonSwaggerGetNoAuth,
  CommonSwaggerPostWithAuth,
} from '../common/decorators/common-swagger.decorator';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) { }

  @Post()
  @CommonSwaggerPostWithAuth({
    summary: 'Create a new game',
    description: 'Creates a new game with optional genre associations',
  })
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Post('seed')
  @CommonSwaggerPostWithAuth({
    summary: 'Seed games data',
    description: 'Seed initial games data with genres',
  })
  createMany() {
    return this.gamesService.createMany();
  }

  @Get()
  @CommonSwaggerGetNoAuth({
    summary: 'Get all games with pagination and filters',
    description:
      'Returns paginated list of games with sorting, filtering, and search capabilities',
  })
  findAll(@Query() paginationDto: PaginationOptionsDto) {
    return this.gamesService.findAll(paginationDto);
  }

  @Get('genres')
  @CommonSwaggerGetNoAuth({
    summary: 'Get all genres',
    description: 'Returns list of all available genres',
  })
  getAllGenres() {
    return this.gamesService.getAllGenres();
  }

  @Get(':id')
  @CommonSwaggerGetNoAuth({
    summary: 'Get game by ID',
    description: 'Returns a single game by its ID',
  })
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Get('slug/:slug')
  @CommonSwaggerGetNoAuth({
    summary: 'Get game by slug',
    description: 'Returns a single game by its slug',
  })
  findOneBySlug(@Param('slug') slug: string) {
    return this.gamesService.findOneBySlug(slug);
  }

  @Patch(':id')
  @CommonSwaggerPostWithAuth({
    summary: 'Update game',
    description: 'Updates a game and its genre associations',
  })
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @CommonSwaggerPostWithAuth({
    summary: 'Delete game',
    description: 'Deletes a game and its genre associations',
  })
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}
