import { Injectable, NestMiddleware } from '@nestjs/common';
import { type RequestMetaStore } from '../types';
import { Request, Response } from 'express';
import { parseAuthHeader } from 'src/common/utils';
import { AsyncLocalStorage } from 'async_hooks';
import { JwtService } from '@nestjs/jwt';
import { isBasicAuthHeader, isBearerAuthHeader } from 'src/common/types';

@Injectable()
export class RequestMetaAsyncLocalStorageMiddleware implements NestMiddleware {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorage<RequestMetaStore>,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    const rawAuthHeader = req.headers.authorization;

    const authHeader = await parseAuthHeader(rawAuthHeader, {
      validateJwt: (token) => !!this.jwtService.decode(token),
    });

    const url = new URL(req.originalUrl, `${req.protocol}://${req.host}`);

    const store: RequestMetaStore = {
      authHeader: {
        rawFormat: rawAuthHeader ?? '',
        ...((isBasicAuthHeader(authHeader) ||
          isBearerAuthHeader(authHeader)) && { ...authHeader }),
      },
      path: url.pathname,
      timestamp: Date.now(),
    };

    this.asyncLocalStorage.run(store, () => next());
  }
}
