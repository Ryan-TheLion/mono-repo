import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { type SupabaseConfig, supabaseConfig } from './supabase.config';
import {
  type CookieMethodsServer,
  type CookieOptionsWithName,
  createServerClient,
  DEFAULT_COOKIE_OPTIONS,
  parseCookieHeader,
} from '@supabase/ssr';
import {
  type GoTrueClient,
  type JwtHeader,
  type Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { type AppSupabaseClaims } from './types';
import {
  type GetSessionUser,
  type GetUser,
  type LoginWithPassword,
  type Logout,
  type RefreshAccessToken,
  type SupabaseServiceMethods,
  type SupabaseSession,
} from './types/client-methods';
import { type TemporalUnit, TemporalUnits } from 'src/common/types';

type AppCookieOptions = Omit<CookieOptionsWithName, 'name' | 'maxAge'> &
  Required<Pick<CookieOptionsWithName, 'name' | 'maxAge'>>;

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
    const cookieOptions = this.getCookieOptions();

    const client = createServerClient(config.projectUrl, config.secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        flowType: 'pkce',
      },
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.cookie ?? '');
        },
        setAll(cookiesToSet) {
          if (response.headersSent) return;

          cookiesToSet.forEach(({ name, value, options }) => {
            if (name.includes(config.cookie.name)) {
              /*
               * [supabase 쿠키 수명 제어]
               *
               * 문제점 (AS-IS):
               * - supabase server client 기본 동작: 쿠키 maxAge = 34560000ms (약 9시간 36분)
               * - 결과: 토큰은 만료되었지만 쿠키는 유효 → 자동 세션 갱신(의도치 않은 자동 세션 갱신) 발생
               *   - autoRefreshToken: false 설정으로도 완전히 차단되지 않음
               *
               * 해결책 (TO-BE): 서버 환경에서 세션 제어의 명시성을 원하기 때문에 수정함
               * - 쿠키 maxAge를 액세스 토큰 만료 시간과 동일하게 설정
               * - 토큰과 쿠키가 동시에 만료되어 자동 갱신 차단
               * - 갱신 필요시 명시적으로 리프레시 토큰 API 호출
               */

              response.cookie(name, value, {
                ...options,
                maxAge: TemporalUnits.convert.secondToMilliSecond(
                  TemporalUnits.of('second', config.cookie.maxAge),
                ),
              });

              return;
            }

            response.cookie(name, value, options);
          });
        },
      } as CookieMethodsServer,
      cookieOptions,
    });

    // @ts-expect-error - suppressGetSessionWarning is protected
    client.auth.suppressGetSessionWarning = true;

    return client;
  }

  getClient(): SupabaseServiceMethods {
    const client = this.createClient();

    return {
      loginWithPassword: (credential) =>
        this.loginWithPassword(client, credential),
      logout: (jwt) => this.logout(client, jwt),
      getUser: (filter) => this.getUser(client, filter),
      getSessionUser: () => this.getSessionUser(client),
      refreshAccessToken: (refreshToken) =>
        this.refreshAccessToken(client, refreshToken),
    };
  }

  private getCookieOptions(): AppCookieOptions {
    const cookieOptions: Required<
      Pick<CookieOptionsWithName, 'name' | 'maxAge'>
    > &
      Pick<CookieOptionsWithName, 'domain' | 'secure' | 'httpOnly'> = {
      name: this.config.cookie.name,
      maxAge: this.config.cookie.maxAge,
      ...(this.config.cookie.domain != null && {
        domain: this.config.cookie.domain,
      }),
      ...(this.config.cookie.secure != null && {
        secure: this.config.cookie.secure,
      }),
      ...(this.config.cookie.httpOnly != null && {
        httpOnly: this.config.cookie.httpOnly,
      }),
    };

    return {
      ...DEFAULT_COOKIE_OPTIONS,
      ...cookieOptions,
    };
  }

  /**
   * Alias for client.auth.getClaims
   */
  private async verifyJwt(
    client: SupabaseClient,
    ...getClaimsParams: Parameters<GoTrueClient['getClaims']>
  ) {
    const { data, error } = await client.auth.getClaims(...getClaimsParams);

    if (error) throw error;

    if (!data) return null;

    return data as {
      claims: AppSupabaseClaims;
      header: JwtHeader;
      signature: Uint8Array;
    };
  }

  private getAppClaims = async (client: SupabaseClient, jwt?: string) => {
    const jwtPayload = await this.verifyJwt(client, jwt);

    if (!jwtPayload) return null;

    return jwtPayload.claims;
  };

  /**
   * 밀리세컨드로 변환된 `expires_at`을 가지는 세션을 반환
   *
   * (supabase session의 `expires_at`은 초단위)
   */
  private convertSession = (
    session: Session,
  ): SupabaseSession<TemporalUnit.MilliSecond> => {
    const { expires_at, ...sessionData } = session;

    return {
      ...sessionData,
      ...(expires_at != null && {
        expires_at: TemporalUnits.convert.secondToMilliSecond(
          TemporalUnits.of('second', expires_at),
        ),
      }),
    };
  };

  private loginWithPassword: LoginWithPassword = async (
    client,
    { email, password },
  ) => {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const claims = (await this.getAppClaims(
      client,
      data.session.access_token,
    ))!;

    return {
      user: claims.user_profile,
      session: this.convertSession(data.session),
    };
  };

  private logout: Logout = async (client, jwt) => {
    const { error } = await client.auth.admin.signOut(jwt);

    if (error) throw error;

    /*
      [supabase 쿠키 삭제]

      maxAge, expires 는 무시되도록 구현되어서 cookie 옵션에 없는 name 속성을 제외하고 옵션으로 전달 
      https://expressjs.com/en/5x/api.html#res.clearCookie
      https://github.com/expressjs/express/blob/master/lib/response.js#L716
    */

    const { name: cookieName, ...options } = this.getCookieOptions();

    for (const key of Object.keys(this.req.cookies)) {
      if (!key.includes(cookieName)) continue;

      this.req.res!.clearCookie(key, { ...options });
    }

    return;
  };

  private getUser: GetUser = async (client, filter) => {
    const claims = await this.getAppClaims(client, filter.jwt);

    if (!claims) return null;

    return claims.user_profile;
  };

  private getSessionUser: GetSessionUser = async (client) => {
    const claims = await this.getAppClaims(client);

    if (!claims) return null;

    return claims.user_profile;
  };

  private refreshAccessToken: RefreshAccessToken = async (
    client,
    refreshToken,
  ) => {
    const { data, error } = await client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;

    if (!data.session)
      throw new InternalServerErrorException(
        '갱신된 정보를 가져올 수 없습니다',
      );

    const claims = (await this.getAppClaims(
      client,
      data.session.access_token,
    ))!;

    return {
      user: claims.user_profile,
      session: this.convertSession(data.session),
    };
  };
}
