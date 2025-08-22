import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ContextIdFactory } from '@nestjs/core';
import { SupabaseService } from 'src/supabase/supabase.service';
import { createBuilder } from 'src/common/utils';
import {
  AuthFilter,
  LoginCredential,
  ProfileResponseDto,
  RefreshAccessTokenRequestDto,
  SupabaseServiceAuthResponse,
} from './dto';
import {
  AUTH_HEADER_TOKEN_TYPE,
  TemporalUnit,
  TemporalUnits,
} from 'src/common/types';
import {
  SupabaseServiceMethods,
  SupabaseSession,
} from 'src/supabase/types/client-methods';
import { Scope } from '@nestjs/common';

class MockSupabaseService {
  getClient = jest.fn().mockReturnValue(mockSupabaseClient) as jest.Mock<
    typeof mockSupabaseClient
  >;
}

const mockSupabaseClient: jest.Mocked<
  ReturnType<SupabaseService['getClient']>
> = {
  loginWithPassword: jest.fn(),
  logout: jest.fn(),
  getUser: jest.fn(),
  getSessionUser: jest.fn(),
  refreshAccessToken: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  const appUser = createBuilder<ProfileResponseDto>()
    .id('user-id')
    .email('user@email.com')
    .phone(null)
    .user_role('user')
    .build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          scope: Scope.REQUEST,
          provide: SupabaseService,
          useClass: MockSupabaseService,
        },
      ],
    }).compile();

    const contextId = ContextIdFactory.create();

    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    authService = await module.resolve(AuthService, contextId);

    await module.resolve<SupabaseService, MockSupabaseService>(
      SupabaseService,
      contextId,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Auth Service가 존재해야 한다', () => {
    expect(authService).toBeDefined();
  });

  describe('loginWithPassword', () => {
    it('SupabaseService의 loginWithPassword를 호출하고 결과를 반환해야 한다', async () => {
      const loginCredential = createBuilder<LoginCredential>()
        .email('login@email.com')
        .password('password')
        .build();

      const userId = 'user-id';

      const authResponse = createBuilder<SupabaseServiceAuthResponse>()
        .user({
          id: userId,
          email: loginCredential.email,
          phone: null,
          user_role: 'user',
        })
        .session({
          access_token: 'accessToken',
          refresh_token: 'refreshToken',
          user: { id: userId, email: loginCredential.email },
          expires_at: TemporalUnits.convert.secondToMilliSecond(
            TemporalUnits.of('second', 300),
          ),
          token_type: AUTH_HEADER_TOKEN_TYPE.Bearer,
          expires_in: 300,
        } as SupabaseSession<TemporalUnit.MilliSecond>)
        .build();

      mockSupabaseClient.loginWithPassword.mockResolvedValue(authResponse);

      const response = await authService.loginWithPassword(loginCredential);

      expect(mockSupabaseClient.loginWithPassword).toHaveBeenNthCalledWith<
        Parameters<SupabaseServiceMethods['loginWithPassword']>
      >(1, loginCredential);

      expect(response).toEqual(authResponse);
    });
  });

  describe('logout', () => {
    it('SupabaseService의 logout을 호출하고 결과를 반환해야 한다', async () => {
      const jwt = 'jwt';

      mockSupabaseClient.logout.mockResolvedValue();

      const response = await authService.logout(jwt);

      expect(mockSupabaseClient.logout).toHaveBeenNthCalledWith<
        Parameters<SupabaseServiceMethods['logout']>
      >(1, jwt);

      expect(response).toBeUndefined();
    });
  });

  describe('getUser', () => {
    it('SupabaseService의 getUser를 호출하고 결과를 반환해야 한다', async () => {
      const filter = createBuilder<AuthFilter.JwtFilter>().jwt('jwt').build();

      mockSupabaseClient.getUser.mockResolvedValue(appUser);

      const response = await authService.getUser(filter);

      expect(mockSupabaseClient.getUser).toHaveBeenNthCalledWith<
        Parameters<SupabaseServiceMethods['getUser']>
      >(1, filter);

      expect(response).toEqual(appUser);
    });
  });

  describe('getSessionUser', () => {
    it('SupabaseService의 getSessionUser를 호출하고 결과를 반환해야 한다', async () => {
      mockSupabaseClient.getSessionUser.mockResolvedValue(appUser);

      const response = await authService.getSessionUser();

      // getSessionUser가 인자 없이 호출되었는지 확인
      expect(mockSupabaseClient.getSessionUser).toHaveBeenNthCalledWith(1);

      expect(response).toEqual(appUser);
    });
  });

  describe('refreshAccessToken', () => {
    it('SupabaseService의 refreshAccessToken을 호출하고 결과를 반환해야 한다', async () => {
      const dto = createBuilder<RefreshAccessTokenRequestDto>()
        .refreshToken('refreshToken')
        .build();

      const authResponse = createBuilder<SupabaseServiceAuthResponse>()
        .user(appUser)
        .session({
          access_token: 'new_accessToken',
          refresh_token: 'new_refreshToken',
          user: { id: appUser.id, email: appUser.email },
          expires_at: TemporalUnits.convert.secondToMilliSecond(
            TemporalUnits.of('second', 300),
          ),
          token_type: AUTH_HEADER_TOKEN_TYPE.Bearer,
          expires_in: 300,
        } as SupabaseSession<TemporalUnit.MilliSecond>)
        .build();

      mockSupabaseClient.refreshAccessToken.mockResolvedValue(authResponse);

      const response = await authService.refreshAccessToken(dto);

      expect(mockSupabaseClient.refreshAccessToken).toHaveBeenNthCalledWith<
        Parameters<SupabaseServiceMethods['refreshAccessToken']>
      >(1, dto.refreshToken);

      expect(response).toEqual(authResponse);
    });
  });
});
