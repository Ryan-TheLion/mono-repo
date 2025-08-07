import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { AppResponseDto } from '../dto';

@Injectable()
export class AppResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (AppResponseDto.isInstance(data)) {
          res.status(data.status);

          if (
            typeof data.response === 'number' ||
            typeof data.response === 'boolean'
          ) {
            res.contentType('application/json');

            return data.response;
          }

          if (typeof data.response === 'string') {
            const str = data.response
              .trim()
              .replace(/^<!(doctype|DOCTYPE) html>/, '<!DOCTYPE html>');

            if (
              !str.startsWith('<!DOCTYPE html>') &&
              !str.startsWith('<html>')
            ) {
              res.contentType('text/plain');
            }

            return data.response;
          }

          return data.response as unknown;
        }

        return data as unknown;
      }),
    );
  }
}
