import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthError } from '@supabase/supabase-js';
import { AsyncLocalStorage } from 'async_hooks';
import { Response } from 'express';
import { type RequestMetaStore } from 'src/async-local-storage/types';
import { CatchedErrorResponseDto } from 'src/common/dto/error';

@Catch(AuthError)
export class SupabaseAuthErrorExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorage<RequestMetaStore>,
  ) {}

  catch(exception: AuthError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const store = this.asyncLocalStorage.getStore()!;

    const message = exception.message;

    const path = store.path;

    Logger.error(`[Supabase AuthError :: ${exception.code}] ${message}`, path);

    res.status(exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR).json(
      CatchedErrorResponseDto.of({
        name: exception.name,
        message,
        path,
        timestamp: store.timestamp,
      }),
    );
  }
}
