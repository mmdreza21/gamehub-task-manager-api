import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenreService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------- CREATE GENRE --------------------
  async create(createGenreDto: CreateGenreDto) {
    const { name, slug } = createGenreDto;

    // Check if genre with same name exists
    const existingGenreByName = await this.prisma.genre.findUnique({
      where: { name },
    });
    if (existingGenreByName) {
      throw new BadRequestException('Genre with this name already exists');
    }

    // Check if genre with same slug exists
    const existingGenreBySlug = await this.prisma.genre.findUnique({
      where: { slug },
    });
    if (existingGenreBySlug) {
      throw new BadRequestException('Genre with this slug already exists');
    }

    // Create genre
    return this.prisma.genre.create({
      data: {
        name,
        slug,
      },
    });
  }

  // -------------------- FIND ALL GENRES --------------------
  async findAllWithGames() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
      include: {
        games: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // -------------------- FIND ONE GENRE --------------------
  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        games: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                slug: true,
                rating: true,
                metacritic: true,
                backgroundImage: true,
              },
            },
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    return genre;
  }

  async findOneBySlug(slug: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { slug },
      include: {
        games: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                slug: true,
                rating: true,
                metacritic: true,
                backgroundImage: true,
              },
            },
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with slug ${slug} not found`);
    }

    return genre;
  }

  // -------------------- UPDATE GENRE --------------------
  async update(id: string, updateGenreDto: UpdateGenreDto) {
    const { name, slug } = updateGenreDto;

    // Check if genre exists
    const existingGenre = await this.prisma.genre.findUnique({
      where: { id },
    });
    if (!existingGenre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    // If name is being updated, check for uniqueness
    if (name && name !== existingGenre.name) {
      const nameExists = await this.prisma.genre.findUnique({
        where: { name },
      });
      if (nameExists) {
        throw new BadRequestException('Genre with this name already exists');
      }
    }

    // If slug is being updated, check for uniqueness
    if (slug && slug !== existingGenre.slug) {
      const slugExists = await this.prisma.genre.findUnique({
        where: { slug },
      });
      if (slugExists) {
        throw new BadRequestException('Genre with this slug already exists');
      }
    }

    // Update genre
    return this.prisma.genre.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    // Check if genre exists
    const genre = await this.prisma.genre.findUnique({
      where: { id },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    // Check if genre has associated games
    const gameCount = await this.prisma.gameGenre.count({
      where: { genreId: id },
    });

    if (gameCount > 0) {
      throw new BadRequestException(
        `Cannot delete genre with ${gameCount} associated game(s). Remove associations first.`,
      );
    }

    // Delete genre
    return this.prisma.genre.delete({
      where: { id },
    });
  }

  // -------------------- BULK OPERATIONS --------------------
  async removeMultiple(ids: string[]) {
    // Check if all genres exist
    const genres = await this.prisma.genre.findMany({
      where: { id: { in: ids } },
      include: {
        games: {
          select: { gameId: true },
        },
      },
    });

    if (genres.length !== ids.length) {
      const foundIds = genres.map((g) => g.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Some genres not found: ${missingIds.join(', ')}`,
      );
    }

    // Check if any genre has associated games
    const genresWithGames = genres.filter((genre) => genre.games.length > 0);
    if (genresWithGames.length > 0) {
      const genreNames = genresWithGames.map((g) => g.name).join(', ');
      throw new BadRequestException(
        `Cannot delete genres with associated games: ${genreNames}`,
      );
    }

    // Delete all genres
    const result = await this.prisma.genre.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      message: `${result.count} genre(s) deleted successfully`,
      count: result.count,
    };
  }

  // -------------------- SEARCH GENRES --------------------
  async search(query: string) {
    return this.prisma.genre.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  // -------------------- GET GENRE STATS --------------------
  async getStats() {
    const totalGenres = await this.prisma.genre.count();

    const genresWithGameCount = await this.prisma.genre.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { games: true },
        },
      },
      orderBy: {
        games: {
          _count: 'desc',
        },
      },
    });

    return {
      meta: {
        total: totalGenres,
      },
      data: genresWithGameCount,
    };
  }
}
