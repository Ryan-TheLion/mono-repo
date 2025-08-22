import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';
import { ContextId, ContextIdFactory, REQUEST } from '@nestjs/core';
import {
  SupabaseConfig,
  supabaseConfig as _supabaseConfig,
} from './supabase.config';
import { Request, Response } from 'express';
import {
  CookieOptionsWithName,
  createServerClient,
  DEFAULT_COOKIE_OPTIONS,
} from '@supabase/ssr';
import { createBuilder } from 'src/common/utils';
import {
  AuthFilter,
  LoginCredential,
  ProfileResponseDto,
  SupabaseAdminSignoutResponse,
  SupabaseServiceAuthResponse,
} from 'src/auth/dto';
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
  User,
} from '@supabase/supabase-js';
import {
  AUTH_HEADER_TOKEN_TYPE,
  TemporalUnit,
  TemporalUnits,
} from 'src/common/types';
import { AppSupabaseClaims } from './types';
import { SupabaseSession } from './types/client-methods';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import { InternalServerErrorException } from '@nestjs/common';

interface SetupConfig {
  req?: Partial<Request>;
  res?: Partial<Response>;
  supabaseConfig?: SupabaseConfig;
}

jest.mock('@supabase/ssr', () => {
  const { DEFAULT_COOKIE_OPTIONS } =
    jest.requireActual<typeof import('@supabase/ssr')>('@supabase/ssr');

  return {
    createServerClient: jest.fn(),
    DEFAULT_COOKIE_OPTIONS,
  };
});

class MockSupabaseClient {
  auth = new MockSupabaseAuthClient();
}

class MockSupabaseAuthClient {
  suppressGetSessionWarning = false;

  getClaims = jest.fn();

  signInWithPassword = jest.fn();

  refreshSession = jest.fn();

  admin = {
    signOut: jest.fn(),
  };
}

const mockSupabaseClient = new MockSupabaseClient();

(createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

describe('SupabaseService', () => {
  let contextId: ContextId;

  const defaultSupabaseConfig: SupabaseConfig = {
    projectUrl: 'https://supabase.project.com',
    jwksUrl: 'https://supabase.project.com/jwks',
    cookie: {
      name: 'cookie-name',
      maxAge: 300,
    },
    secretKey: 'sb_secret_my_key',
  };

  const setup = async (setupConfig: SetupConfig = {}) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: _supabaseConfig.KEY,
          useFactory() {
            return setupConfig?.supabaseConfig ?? defaultSupabaseConfig;
          },
        },
        {
          provide: REQUEST,
          useValue: {
            ...setupConfig?.req,
            res: {
              headersSent: false,
              ...setupConfig?.res,
            },
          },
        },
        SupabaseService,
      ],
    }).compile();

    return {
      supabaseService: await module.resolve(SupabaseService, contextId),
      config: module.get<SupabaseConfig>(_supabaseConfig.KEY),
    };
  };

  const convertSession = (
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

  const getCookieOptions = (config: SupabaseConfig) => {
    const cookieOptions: Required<
      Pick<CookieOptionsWithName, 'name' | 'maxAge'>
    > &
      Pick<CookieOptionsWithName, 'domain' | 'secure' | 'httpOnly'> = {
      name: config.cookie.name,
      maxAge: config.cookie.maxAge,
      ...(config.cookie.domain != null && {
        domain: config.cookie.domain,
      }),
      ...(config.cookie.secure != null && {
        secure: config.cookie.secure,
      }),
      ...(config.cookie.httpOnly != null && {
        httpOnly: config.cookie.httpOnly,
      }),
    };

    return {
      ...DEFAULT_COOKIE_OPTIONS,
      ...cookieOptions,
    };
  };

  beforeEach(() => {
    contextId = ContextIdFactory.create();

    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('Supabase Service가 존재해야 한다', async () => {
    const { supabaseService } = await setup();

    expect(supabaseService).toBeDefined();
  });

  test('client 생성시 supabase config 설정이 적용되어야 한다', async () => {
    const supabaseConfig = createBuilder<SupabaseConfig>()
      .projectUrl('https://project.com')
      .jwksUrl('https://project.com/jwks')
      .cookie({
        name: 'cookie-name',
        maxAge: 300,
      })
      .secretKey('sb_secret_my_key')
      .build();

    const { supabaseService } = await setup(
      createBuilder<SetupConfig>().supabaseConfig(supabaseConfig).build(),
    );

    supabaseService.getClient();

    expect(createServerClient).toHaveBeenNthCalledWith<
      Parameters<typeof createServerClient>
    >(
      1,
      supabaseConfig.projectUrl,
      supabaseConfig.secretKey,
      expect.objectContaining({
        cookieOptions: {
          ...DEFAULT_COOKIE_OPTIONS,
          ...supabaseConfig.cookie,
        },
      }) as Parameters<typeof createServerClient>[2],
    );
  });

  describe('loginWithPassword', () => {
    const loginCredential = createBuilder<LoginCredential>()
      .email('login@email.com')
      .password('password')
      .build();

    it('SupabaseAuthClient의 signInWithPassword를 호출하고 결과를 반환해야 한다', async () => {
      const { supabaseService, config } = await setup();

      const user = createBuilder<ProfileResponseDto>()
        .id('user-id')
        .email(loginCredential.email)
        .phone(null)
        .user_role('user')
        .build();

      const iat = Math.floor(Date.now() / 1000);
      const expiresAt = iat + config.cookie.maxAge;

      const signInWithPasswordResponse =
        createBuilder<AuthTokenResponsePassword>()
          .data({
            user: user as unknown as User,
            session: {
              access_token: 'accessToken',
              refresh_token: 'refreshToken',
              user: user as unknown as User,
              expires_in: expiresAt,
              token_type: AUTH_HEADER_TOKEN_TYPE.Bearer,
              expires_at: expiresAt,
            },
          })
          .error(null)
          .build();

      const claims = {
        user_profile: user,
      } as unknown as AppSupabaseClaims;

      const expectedResponse = createBuilder<SupabaseServiceAuthResponse>()
        .user(user)
        .session(convertSession(signInWithPasswordResponse.data.session!))
        .build();

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(
        signInWithPasswordResponse,
      );

      mockSupabaseClient.auth.getClaims.mockResolvedValue({
        data: {
          claims,
        },
      });

      const response = await supabaseService
        .getClient()
        .loginWithPassword(loginCredential);

      expect(
        mockSupabaseClient.auth.signInWithPassword,
      ).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['signInWithPassword']>
      >(1, loginCredential);

      expect(mockSupabaseClient.auth.getClaims).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['getClaims']>
      >(1, signInWithPasswordResponse.data.session!.access_token);

      expect(response).toEqual(expectedResponse);
    });

    it('SupabaseAuthClient의 signInWithPassword에서 AuthError를 반환할 경우 해당 AuthError가 발생해야 한다', async () => {
      const { supabaseService } = await setup();

      const signInWithPasswordResponse =
        createBuilder<AuthTokenResponsePassword>()
          .data({ user: null, session: null })
          .error(new AuthError('auth error'))
          .build();

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(
        signInWithPasswordResponse,
      );

      const response = await supabaseService
        .getClient()
        .loginWithPassword(loginCredential)
        .catch((error) => error as unknown);

      expect(mockSupabaseClient.auth.getClaims).not.toHaveBeenCalled();

      expect(
        mockSupabaseClient.auth.signInWithPassword,
      ).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['signInWithPassword']>
      >(1, loginCredential);

      expect(response).toBeInstanceOf(AuthError);
      expect((response as AuthError).message).toBe(
        signInWithPasswordResponse.error!.message,
      );
    });
  });

  describe('logout', () => {
    it('SupabaseAuthClient의 admin.logout을 호출하고 결과를 반환하고, supabase 쿠키를 삭제해야 한다', async () => {
      const mockResponse: Partial<Response> = {
        clearCookie: jest.fn(),
      };

      const { supabaseService, config } = await setup(
        createBuilder<SetupConfig>()
          .req({
            cookies: {
              [defaultSupabaseConfig.cookie.name]: 'cookie',
            },
          })
          .res(mockResponse)
          .build(),
      );

      const jwt = 'jwt';

      const adminSignOutResponse = createBuilder<SupabaseAdminSignoutResponse>()
        .data(null)
        .error(null)
        .build();

      const cookieOptions = getCookieOptions(config);

      const { name: clearCookieName, ...clearCookieOptions } = cookieOptions;

      mockSupabaseClient.auth.admin.signOut.mockResolvedValue(
        adminSignOutResponse,
      );

      const response = await supabaseService.getClient().logout(jwt);

      expect(mockResponse.clearCookie!).toHaveBeenNthCalledWith<
        Parameters<Response['clearCookie']>
      >(1, clearCookieName, clearCookieOptions);

      expect(response).toBeUndefined();
    });

    it('SupabaseAuthClient의 admin.logout에서 AuthError를 반환할 경우 해당 AuthError가 발생해야 한다', async () => {
      const mockResponse: Partial<Response> = {
        clearCookie: jest.fn(),
      };

      const { supabaseService } = await setup(
        createBuilder<SetupConfig>()
          .req({
            cookies: {
              [defaultSupabaseConfig.cookie.name]: 'cookie',
            },
          })
          .res(mockResponse)
          .build(),
      );

      const jwt = 'jwt';

      const adminSignOutResponse = createBuilder<SupabaseAdminSignoutResponse>()
        .data(null)
        .error(new AuthError('auth error'))
        .build();

      mockSupabaseClient.auth.admin.signOut.mockResolvedValue(
        adminSignOutResponse,
      );

      const response = await supabaseService
        .getClient()
        .logout(jwt)
        .catch((error) => error as unknown);

      expect(mockSupabaseClient.auth.admin.signOut).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['admin']['signOut']>
      >(1, jwt);

      expect(mockResponse.clearCookie).not.toHaveBeenCalled();

      expect(response).toBeInstanceOf(AuthError);
      expect((response as AuthError).message).toBe(
        adminSignOutResponse.error!.message,
      );
    });
  });

  describe('getUser', () => {
    it('getClaims가 jwt에 대해 유효한 claims를 반환하면 사용자 정보를 반환해야 한다', async () => {
      const { supabaseService } = await setup();

      const user = createBuilder<ProfileResponseDto>()
        .id('user-id')
        .email('user@email.com')
        .phone(null)
        .user_role('user')
        .build();

      const filter = createBuilder<AuthFilter.JwtFilter>().jwt('jwt').build();

      const claims = {
        user_profile: user,
      } as unknown as AppSupabaseClaims;

      mockSupabaseClient.auth.getClaims.mockResolvedValue({
        data: {
          claims,
        },
      });

      const response = await supabaseService.getClient().getUser(filter);

      expect(mockSupabaseClient.auth.getClaims).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['getClaims']>
      >(1, filter.jwt);

      expect(response).toEqual(claims.user_profile);
    });
  });

  describe('getSessionUser', () => {
    it('getClaims가 유효한 claims를 반환하면 사용자 정보를 반환해야 한다', async () => {
      const { supabaseService } = await setup();

      const user = createBuilder<ProfileResponseDto>()
        .id('user-id')
        .email('user@email.com')
        .phone(null)
        .user_role('user')
        .build();

      const claims = {
        user_profile: user,
      } as unknown as AppSupabaseClaims;

      mockSupabaseClient.auth.getClaims.mockResolvedValue({
        data: {
          claims,
        },
      });

      const response = await supabaseService.getClient().getSessionUser();

      // getClaims가 인자 없이 호출되었는지 확인
      expect(mockSupabaseClient.auth.getClaims).toHaveBeenNthCalledWith(
        1,
        undefined,
      );

      expect(response).toEqual(claims.user_profile);
    });
  });

  describe('refreshAccessToken', () => {
    const requestRefreshToken = 'refreshToken';

    it('SupabaseAuthClient의 refreshSession을 호출하고 결과를 반환해야 한다', async () => {
      const { supabaseService, config } = await setup();

      const user = createBuilder<ProfileResponseDto>()
        .id('user-id')
        .email('user@email.com')
        .phone(null)
        .user_role('user')
        .build();

      const claims = {
        user_profile: user,
      } as unknown as AppSupabaseClaims;

      const iat = Math.floor(Date.now() / 1000);
      const expiresAt = iat + config.cookie.maxAge;

      const authResponse = createBuilder<AuthResponse>()
        .data({
          user: { id: user.id, email: user.email } as User,
          session: {
            access_token: 'new_accessToken',
            refresh_token: 'new_refreshToken',
            user: { id: user.id, email: user.email } as User,
            expires_in: expiresAt,
            token_type: AUTH_HEADER_TOKEN_TYPE.Bearer,
            expires_at: expiresAt,
          },
        })
        .error(null)
        .build();

      const expectedResponse = createBuilder<SupabaseServiceAuthResponse>()
        .user(claims.user_profile)
        .session(convertSession(authResponse.data.session!))
        .build();

      mockSupabaseClient.auth.getClaims.mockResolvedValue({
        data: {
          claims,
        },
      });

      mockSupabaseClient.auth.refreshSession.mockResolvedValue(authResponse);

      const response = await supabaseService
        .getClient()
        .refreshAccessToken(requestRefreshToken);

      expect(mockSupabaseClient.auth.getClaims).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['getClaims']>
      >(1, authResponse.data.session!.access_token);

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['refreshSession']>
      >(1, {
        refresh_token: requestRefreshToken,
      });

      expect(response).toEqual(expectedResponse);
    });

    it('SupabaseAuthClient의 refreshSession에서 AuthError를 반환할 경우 해당 AuthError가 발생해야 한다', async () => {
      const { supabaseService } = await setup();

      const authResponse = createBuilder<AuthResponse>()
        .data({ user: null, session: null })
        .error(new AuthError('auth error'))
        .build();

      mockSupabaseClient.auth.refreshSession.mockResolvedValue(authResponse);

      const response = await supabaseService
        .getClient()
        .refreshAccessToken(requestRefreshToken)
        .catch((error) => error as unknown);

      expect(mockSupabaseClient.auth.getClaims).not.toHaveBeenCalled();

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['refreshSession']>
      >(1, {
        refresh_token: requestRefreshToken,
      });

      expect(response).toBeInstanceOf(AuthError);
      expect((response as AuthError).message).toBe(authResponse.error!.message);
    });

    it('SupabaseAuthClient의 refreshSession에서 session이 null인 경우 InternalServerException이 발생해야 한다', async () => {
      const { supabaseService } = await setup();

      const user = createBuilder<ProfileResponseDto>()
        .id('user-id')
        .email('user@email.com')
        .phone(null)
        .user_role('user')
        .build();

      const authResponse = createBuilder<AuthResponse>()
        .data({
          user: { id: user.id, email: user.email } as User,
          session: null,
        })
        .error(null)
        .build();

      mockSupabaseClient.auth.refreshSession.mockResolvedValue(authResponse);

      const response = await supabaseService
        .getClient()
        .refreshAccessToken(requestRefreshToken)
        .catch((error) => error as unknown);

      expect(mockSupabaseClient.auth.getClaims).not.toHaveBeenCalled();

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenNthCalledWith<
        Parameters<SupabaseAuthClient['refreshSession']>
      >(1, { refresh_token: requestRefreshToken });

      expect(response).toBeInstanceOf(InternalServerErrorException);
    });
  });
});
