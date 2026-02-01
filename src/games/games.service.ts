import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationOptionsDto, GameSortField } from './dto/pagination.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { paginatePrisma } from 'src/common/utils/pagination';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------- CREATE GAME --------------------
  async create(createGameDto: CreateGameDto) {
    const { genreIds, ...gameData } = createGameDto;

    // Check if game with same slug exists
    const existingGame = await this.prisma.game.findUnique({
      where: { slug: gameData.slug },
    });
    if (existingGame) {
      throw new BadRequestException('Game with this slug already exists');
    }

    // Validate genres if provided
    if (genreIds?.length) {
      const genres = await this.prisma.genre.findMany({
        where: { id: { in: genreIds } },
      });
      if (genres.length !== genreIds.length) {
        throw new NotFoundException('One or more genres not found');
      }
    }

    // Create game within transaction
    return this.prisma.$transaction(async (prisma) => {
      const game = await prisma.game.create({
        data: gameData,
      });

      if (genreIds?.length) {
        await prisma.gameGenre.createMany({
          data: genreIds.map((genreId) => ({
            gameId: game.id,
            genreId,
          })),
        });
      }

      return this.findOne(game.id);
    });
  }

  // -------------------- FIND ALL WITH PAGINATION --------------------
  async findAll(paginationDto: PaginationOptionsDto) {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      genres,
      minRating,
      maxRating,
      minMetacritic,
      maxMetacritic,
    } = paginationDto;

    const where: Prisma.GameWhereInput = {};

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by genres
    if (genres?.length) {
      where.genres = {
        some: {
          genreId: { in: genres },
        },
      };
    }

    // Filter by rating range
    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) where.rating.gte = minRating;
      if (maxRating !== undefined) where.rating.lte = maxRating;
    }

    // Filter by metacritic range
    if (minMetacritic !== undefined || maxMetacritic !== undefined) {
      where.metacritic = {};
      if (minMetacritic !== undefined) where.metacritic.gte = minMetacritic;
      if (maxMetacritic !== undefined) where.metacritic.lte = maxMetacritic;
    }

    // Build orderBy clause
    const orderBy: Prisma.GameOrderByWithRelationInput = {};

    switch (sortBy) {
      case GameSortField.NAME:
        orderBy.name = sortOrder;
        break;
      case GameSortField.RELEASED:
        orderBy.released = sortOrder;
        break;
      case GameSortField.RATING:
        orderBy.rating = sortOrder;
        break;
      case GameSortField.METACRITIC:
        orderBy.metacritic = sortOrder;
        break;
      case GameSortField.CREATED_AT:
        orderBy.createdAt = sortOrder;
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    // Use paginatePrisma with proper options
    return paginatePrisma(
      this.prisma.game,
      { page, limit, search },
      {
        where,
        orderBy,
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      },
    );
  }

  // -------------------- FIND ONE GAME --------------------
  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }

  async findOneBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with slug ${slug} not found`);
    }

    return game;
  }


  async update(id: string, updateGameDto: UpdateGameDto) {
    const { genreIds, ...gameData } = updateGameDto;

    // Check if game exists
    const existingGame = await this.prisma.game.findUnique({
      where: { id },
    });
    if (!existingGame) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

   
    if (gameData.slug && gameData.slug !== existingGame.slug) {
      const slugExists = await this.prisma.game.findUnique({
        where: { slug: gameData.slug },
      });
      if (slugExists) {
        throw new BadRequestException('Game with this slug already exists');
      }
    }


    if (genreIds) {
      const genres = await this.prisma.genre.findMany({
        where: { id: { in: genreIds } },
      });
      if (genres.length !== genreIds.length) {
        throw new NotFoundException('One or more genres not found');
      }
    }

    
    return this.prisma.$transaction(async (prisma) => {
      await prisma.game.update({
        where: { id },
        data: gameData,
      });

      if (genreIds) {
 
        await prisma.gameGenre.deleteMany({
          where: { gameId: id },
        });

    
        await prisma.gameGenre.createMany({
          data: genreIds.map((genreId) => ({
            gameId: id,
            genreId,
          })),
        });
      }

      return this.findOne(id);
    });
  }

  
  async remove(id: string) {

    const game = await this.prisma.game.findUnique({
      where: { id },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

   
    return this.prisma.$transaction(async (prisma) => {
 
      await prisma.gameGenre.deleteMany({
        where: { gameId: id },
      });

   
      return prisma.game.delete({
        where: { id },
      });
    });
  }


  async getAllGenres() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

 
  async createMany() {
 
    const { games, genres } = require('src/utilities/Data');

   
    await this.prisma.genre.createMany({
      data: genres,
    });

    
    const gamesWithoutGenres = games.map(({ genreIds, ...g }) => g);

    await this.prisma.game.createMany({
      data: gamesWithoutGenres,
    });

  
    const dbGames = await this.prisma.game.findMany({
      select: { id: true, slug: true },
    });

    for (const game of games) {
      const dbGame = dbGames.find((g) => g.slug === game.slug);
      if (!dbGame) continue;

      await this.prisma.gameGenre.createMany({
        data: game.genreIds.map((genreId) => ({
          gameId: dbGame.id,
          genreId,
        })),
      });
    }

    return {
      message: 'Genres, games, and relations seeded successfully',
      genresCount: genres.length,
      gamesCount: games.length,
    };
  }



}
