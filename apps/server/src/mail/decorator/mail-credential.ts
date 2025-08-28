import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { isBearerAuthHeader } from 'src/common/types';
import { parseAuthHeader } from 'src/common/utils';
import { MailCredentialDto } from '../dto/credential.dto';
import { ProfileResponseDto } from 'src/auth/dto';

/**
 * Mail Credential
 *
 * `{ user, token }`
 *
 * - user : `req.user.email`
 *
 * - token : Bearer JWT
 *
 * @example
 *
 * ```ts
 * ＠UseGuards(SupabaseJwksGuard)
 * async mailCredentialParamMethod (@MailCredential() credential: MailCredentialDto) {}
 * ```
 */
export const MailCredential = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (!req || !req?.user) return null;

    const authHeader = req.headers['authorization'];

    const parsedAuthHeader = await parseAuthHeader(authHeader);

    const token = isBearerAuthHeader(parsedAuthHeader)
      ? parsedAuthHeader.jwt
      : null;

    if (!token) return null;

    return {
      user: (req.user as ProfileResponseDto).email,
      token,
    } satisfies MailCredentialDto;
  },
);
