import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import {
  CommonSwaggerGetNoAuth,
  CommonSwaggerPostWithAuth,
} from '../common/decorators/common-swagger.decorator';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) { }

  @Post()
  @CommonSwaggerPostWithAuth({
    summary: 'Create a new genre',
    description: 'Creates a new game genre with unique name and slug',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  @CommonSwaggerGetNoAuth({
    summary: 'Get all genres',
    description: 'Returns a list of all genres with their associated games',
  })
  findAll() {
    return this.genreService.findAll();
  }

  @Get('/with-games')
  @CommonSwaggerGetNoAuth({
    summary: 'Get all genres',
    description: 'Returns a list of all genres with their associated games',
  })
  findAllWithGames() {
    return this.genreService.findAllWithGames();
  }

  @Get('search')
  @CommonSwaggerGetNoAuth({
    summary: 'Search genres',
    description: 'Search genres by name or slug',
  })
  search(@Query('q') query: string) {
    return this.genreService.search(query);
  }

  @Get('stats')
  @CommonSwaggerGetNoAuth({
    summary: 'Get genre statistics',
    description: 'Returns statistics about genres including game counts',
  })
  getStats() {
    return this.genreService.getStats();
  }

  @Get(':id')
  @CommonSwaggerGetNoAuth({
    summary: 'Get genre by ID',
    description: 'Returns a single genre by its ID with associated games',
  })
  findOne(@Param('id') id: string) {
    return this.genreService.findOne(id);
  }

  @Get('slug/:slug')
  @CommonSwaggerGetNoAuth({
    summary: 'Get genre by slug',
    description: 'Returns a single genre by its slug with associated games',
  })
  findOneBySlug(@Param('slug') slug: string) {
    return this.genreService.findOneBySlug(slug);
  }

  @Patch(':id')
  @CommonSwaggerPostWithAuth({
    summary: 'Update genre',
    description: 'Updates a genre (name and/or slug)',
  })
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @CommonSwaggerPostWithAuth({
    summary: 'Delete genre',
    description: 'Deletes a genre if it has no associated games',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.genreService.remove(id);
  }

  @Delete()
  @CommonSwaggerPostWithAuth({
    summary: 'Delete multiple genres',
    description:
      'Deletes multiple genres at once (only if they have no associated games)',
  })
  @HttpCode(HttpStatus.OK)
  removeMultiple(@Body('ids') ids: string[]) {
    return this.genreService.removeMultiple(ids);
  }
}
