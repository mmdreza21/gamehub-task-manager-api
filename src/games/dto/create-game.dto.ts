export class CreateGameDto {
  slug: string;
  name: string;
  description?: string;
  released?: Date;
  rating?: number;
  ratingsCount?: number;
  metacritic?: number;
  tags?: string[];
  backgroundImage?: string;

  genreIds: string[];
}
