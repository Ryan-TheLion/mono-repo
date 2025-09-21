import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * `req.user`
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (!req || !req?.user) {
      return null;
    }

    return req.user;
  },
);
