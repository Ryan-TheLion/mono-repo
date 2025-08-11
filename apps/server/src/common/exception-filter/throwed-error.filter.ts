import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { type RequestMetaStore } from 'src/async-local-storage/types';
import { CatchedErrorResponseDto } from '../dto/error';
import { Response } from 'express';

@Catch()
export class ThrowedErrorExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorage<RequestMetaStore>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const store = this.asyncLocalStorage.getStore()!;

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      CatchedErrorResponseDto.of({
        name: (exception?.['name'] as string) || 'Error',
        message: (exception?.['message'] as string) || 'error',
        path: store.path,
        timestamp: store.timestamp,
      } as CatchedErrorResponseDto),
    );
  }
}
