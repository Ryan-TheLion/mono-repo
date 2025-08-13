import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { type SupabaseConfig, supabaseConfig } from './supabase.config';
import {
  CookieMethodsServer,
  CookieOptionsWithName,
  createServerClient,
  DEFAULT_COOKIE_OPTIONS,
  parseCookieHeader,
} from '@supabase/ssr';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  constructor(
    @Inject(supabaseConfig.KEY) private readonly config: SupabaseConfig,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  private createClient() {
    const request = this.req;
    const response = request.res!;

    const config = this.config;

    const cookieOptions: Pick<
      CookieOptionsWithName,
      'name' | 'domain' | 'secure' | 'httpOnly'
    > = {
      ...(config.cookie.name != null && { name: config.cookie.name }),
      ...(config.cookie.domain != null && { domain: config.cookie.domain }),
      ...(config.cookie.secure != null && { secure: config.cookie.secure }),
      ...(config.cookie.httpOnly != null && { secure: config.cookie.httpOnly }),
    };

    return createServerClient(config.projectUrl, config.secretKey, {
      auth: {
        autoRefreshToken: false,
        flowType: 'pkce',
      },
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.cookie ?? '');
        },
        setAll(cookiesToSet) {
          if (response.headersSent) return;

          cookiesToSet.forEach(({ name, value, options }) => {
            response?.cookie(name, value, options);
          });
        },
      } as CookieMethodsServer,
      cookieOptions: {
        ...DEFAULT_COOKIE_OPTIONS,
        ...cookieOptions,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getClient() {
    const client = this.createClient();

    // TODO: supabase 서비스 메소드 반환
    return {
      client,
    };
  }
}
