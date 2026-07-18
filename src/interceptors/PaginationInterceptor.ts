import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

export class PaginationInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: Type<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(
        (data: { data: any[]; total: number; page: number; limit: number }) => {
          return {
            data: plainToInstance(this.dto, data.data, {}),
            meta: {
              total: data.total,
              page: data.page,
              limit: data.limit,
            },
          };
        },
      ),
    );
  }
}
