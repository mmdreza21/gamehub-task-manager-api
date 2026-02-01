export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginateOptions {
  include?: any;
  select?: any;
  where?: any;
  orderBy?: any;
}

export async function paginatePrisma<T>(
  model: any,
  options: PaginationOptions,
  paginateOptions?: PaginateOptions,
): Promise<PaginationResult<T>> {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  // Build the findMany query
  const findManyQuery: any = {
    skip,
    take: limit, // Ensure this is a number
  };

  // Add optional fields if provided
  if (paginateOptions?.where) {
    findManyQuery.where = paginateOptions.where;
  }

  if (paginateOptions?.orderBy) {
    findManyQuery.orderBy = paginateOptions.orderBy;
  }

  if (paginateOptions?.include) {
    findManyQuery.include = paginateOptions.include;
  }

  if (paginateOptions?.select) {
    findManyQuery.select = paginateOptions.select;
  }

  const [data, total] = await Promise.all([
    model.findMany(findManyQuery),
    model.count({ where: paginateOptions?.where || {} }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
