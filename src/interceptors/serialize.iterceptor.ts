import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: Type<T>) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((result: any) => {
        // If it has "data" + "meta", transform data only
        if (result && result.data && Array.isArray(result.data)) {
          return {
            ...result,
            data: plainToInstance(this.dto, result.data, {
              excludeExtraneousValues: true,
            }),
          };
        }

        // Else normal transformation
        return plainToInstance(this.dto, result, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
