import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdValidator implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (!Types.ObjectId.isValid(req.params.id as string)) {
      throw new BadRequestException('this id is not object id dud');
    }
    next();
  }
}

//! Functional middleware#
// The LoggerMiddleware class we've been using is quite simple. It has no members, no additional methods, and no dependencies. Why can't we just define it in a simple function instead of a class? In fact, we can. This type of middleware is called functional middleware. Let's transform the logger middleware from class-based into functional middleware to illustrate the difference:

// logger.middleware.ts

// import { Request, Response, NextFunction } from 'express';

// export function logger(req: Request, res: Response, next: NextFunction) {
//   console.log(`Request...`);
//   next();
// };
