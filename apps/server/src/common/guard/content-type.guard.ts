import {
  BadRequestException,
  CanActivate,
  Injectable,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CONTENT_TYPE_METADATA_KEY } from '../decorator';

@Injectable()
export class ContentTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const contentType = req.headers['content-type'];

    const allowedContentType =
      this.reflector.get<string>(
        CONTENT_TYPE_METADATA_KEY,
        context.getHandler(),
      ) ?? '';

    const targetContentType = allowedContentType.trim();

    if (!targetContentType) return true;

    if (!contentType) {
      throw new BadRequestException('Content-Type 헤더를 설정해주세요');
    }

    if (!contentType.startsWith(targetContentType)) {
      throw new BadRequestException(`유효한 Content-Type 헤더가 아닙니다`);
    }

    return true;
  }
}
