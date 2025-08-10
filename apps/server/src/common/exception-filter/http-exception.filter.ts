import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { CatchedErrorResponseDto } from '../dto/error';
import { AsyncLocalStorage } from 'async_hooks';
import { type RequestMetaStore } from 'src/async-local-storage/types';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorage<RequestMetaStore>,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const store = this.asyncLocalStorage.getStore()!;

    res.status(exception.getStatus()).json(
      CatchedErrorResponseDto.of({
        name: exception.name,
        message: exception.message,
        path: store.path,
        timestamp: store.timestamp,
      }),
    );
  }
}
