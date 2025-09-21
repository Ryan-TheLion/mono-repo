import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import {
  type AuthHeaderTokenType,
  isBasicAuthHeader,
  isBearerAuthHeader,
} from 'src/common/types';
import { parseAuthHeader } from 'src/common/utils';

type AuthHeaderType = AuthHeaderTokenType | 'Raw';

/**
 * Request `Authorization` 헤더 추출
 *
 * - type
 *   - 'Raw' (기본값) : Authorization 헤더 문자열 그대로를 반환, Authorization 헤더가 없을 경우 '' 반환
 *   - 'Basic' : 유효한 Basic 형식 문자열인 경우 파싱된 credential 반환, 유효하지 않은 경우 null 반환
 *   - 'Bearer' : 유효한 Bearer JWT 형식 문자열인 경우 파싱된 JWT 문자열 반환, 유효하지 않은 경우 '' 반환
 *
 * @example
 *
 * ```ts
 * async rawHeaderParamMethod (@AuthHeader('Raw') authHeader: string) {}
 *
 * async basicTokenParamMethod (@AuthHeader('Basic') credential: BasicAuthHeaderCredential) {}
 * async basicTokenParamMethod (@AuthHeader('Basic') credential: BasicAuthHeaderCredential | null) {}
 *
 * async bearerJwtParamMethod (@AuthHeader('Bearer') token: string) {}
 * ```
 */
export const AuthHeader = createParamDecorator(
  async (type: AuthHeaderType = 'Raw', ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const authHeader = req.headers['authorization'];

    if (type === 'Raw') return authHeader ?? '';

    const parsedAuthHeader = await parseAuthHeader(authHeader);

    if (type === 'Basic') {
      return isBasicAuthHeader(parsedAuthHeader)
        ? parsedAuthHeader.credential
        : null;
    }

    return isBearerAuthHeader(parsedAuthHeader) ? parsedAuthHeader.jwt : '';
  },
);
