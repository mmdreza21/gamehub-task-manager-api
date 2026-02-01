import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum GameSortField {
  NAME = 'name',
  RELEASED = 'released',
  RATING = 'rating',
  METACRITIC = 'metacritic',
  CREATED_AT = 'createdAt',
}

export class PaginationOptionsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: GameSortField,
    default: GameSortField.CREATED_AT,
  })
  @IsEnum(GameSortField)
  @IsOptional()
  sortBy?: GameSortField = GameSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  genres?: string[];

  @ApiPropertyOptional({ minimum: 0, maximum: 5 })
  @Type(() => Number)
  @IsOptional()
  minRating?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 5 })
  @Type(() => Number)
  @IsOptional()
  maxRating?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  minMetacritic?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  maxMetacritic?: number;
}
