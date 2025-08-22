import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AsyncLocalStorage } from 'async_hooks';
import { AuthService } from './auth.service';
import { createBuilder } from 'src/common/utils';
import { RequestMetaStore } from 'src/async-local-storage/types';
import {
  AUTH_HEADER_TOKEN_TYPE,
  BasicAuthHeaderCredential,
  TemporalUnit,
  TemporalUnits,
} from 'src/common/types';
import {
  AuthFilter,
  LoginWithPasswordRequestDto,
  LoginWithPasswordResponseDto,
  ProfileResponseDto,
  RefreshAccessTokenRequestDto,
  RefreshAccessTokenResponseDto,
  SupabaseServiceAuthResponse,
} from './dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseSession } from 'src/supabase/types/client-methods';
import { AppResponseDto } from 'src/common/dto';

class MockAsyncLocalStorage {
  getStore = jest.fn();
}

class MockAuthService {
  loginWithPassword = jest.fn();

  logout = jest.fn();

  getUser = jest.fn();

  getSessionUser = jest.fn();

  refreshAccessToken = jest.fn();
}

describe('AuthController', () => {
  let authController: AuthController;
  let authService: MockAuthService;
  let asyncLocalStorage: MockAsyncLocalStorage;

  const appUser = createBuilder<ProfileResponseDto>()
    .id('user-id')
    .email('user@email.com')
    .phone(null)
    .user_role('user')
    .build();

  const storeWithBasicAuthHeader = ({
    path,
    credential,
  }: {
    path: string;
    credential: BasicAuthHeaderCredential;
  }) => {
    return createBuilder<RequestMetaStore>()
      .authHeader({
        rawFormat: `${AUTH_HEADER_TOKEN_TYPE.Basic} ${credential.user}:${credential.password}`,
        type: 'Basic',
        credential,
      })
      .path(path)
      .timestamp(Date.now())
      .build();
  };

  const storeWithBearerAuthHeader = ({
    path,
    jwt,
  }: {
    path: string;
    jwt: string;
  }) => {
    return createBuilder<RequestMetaStore>()
      .authHeader({
        rawFormat: `${AUTH_HEADER_TOKEN_TYPE.Bearer} ${jwt}`,
        type: 'Bearer',
        jwt,
      })
      .path(path)
      .timestamp(Date.now())
      .build();
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AsyncLocalStorage,
          useClass: MockAsyncLocalStorage,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
      ],
      controllers: [AuthController],
    }).compile();

    asyncLocalStorage = module.get<MockAsyncLocalStorage>(AsyncLocalStorage);

    authController = module.get<AuthController>(AuthController);
    authService = module.get<MockAuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Auth Controller가 존재해야 한다', () => {
    expect(authController).toBeDefined();
  });

  describe('POST /auth/login > loginWithPassword', () => {
    const loginPath = '/auth/login';

    const loginRequestDto = createBuilder<LoginWithPasswordRequestDto>()
      .email('login@email.com')
      .password('password')
      .build();

    it('(Basic) Authorization 헤더가 있으면 BadRequestException이 발생하고, AuthService의 loginWithPassword가 호출되지 않아야 한다', async () => {
      const credential = createBuilder<BasicAuthHeaderCredential>()
        .user(loginRequestDto.email)
        .password(loginRequestDto.password)
        .build();

      asyncLocalStorage.getStore.mockReturnValue(
        storeWithBasicAuthHeader({ path: loginPath, credential }),
      );

      await expect(
        authController.loginWithPassword(loginRequestDto),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(authService.loginWithPassword).not.toHaveBeenCalled();
    });

    it('(Bearer) Authorization 헤더가 있으면 BadRequestException이 발생하고, AuthService의 loginWithPassword가 호출되지 않아야 한다', async () => {
      const bearerToken = 'jwt';

      asyncLocalStorage.getStore.mockReturnValue(
        storeWithBearerAuthHeader({ path: loginPath, jwt: bearerToken }),
      );

      await expect(
        authController.loginWithPassword(loginRequestDto),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(authService.loginWithPassword).not.toHaveBeenCalled();
    });

    it('AuthService의 loginWithPassword를 호출하고 결과를 반환해야 한다', async () => {
      const store = createBuilder<RequestMetaStore>()
        .authHeader({ rawFormat: '' })
        .path(loginPath)
        .timestamp(Date.now())
        .build();

      const user = createBuilder<ProfileResponseDto>()
        .id('user-id')
        .email(loginRequestDto.email)
        .phone(null)
        .user_role('user')
        .build();

      const authResponse = createBuilder<SupabaseServiceAuthResponse>()
        .user(user)
        .session({
          access_token: 'accessToken',
          refresh_token: 'refreshToken',
          user: { id: user.id, email: user.email },
          token_type: AUTH_HEADER_TOKEN_TYPE.Bearer,
          expires_at: TemporalUnits.convert.secondToMilliSecond(
            TemporalUnits.of('second', 300),
          ),
          expires_in: 300,
        } as SupabaseSession<TemporalUnit.MilliSecond>)
        .build();

      const responseDto = createBuilder<LoginWithPasswordResponseDto>()
        .accessToken(authResponse.session.access_token)
        .refreshToken(authResponse.session.refresh_token)
        .expiresAt(authResponse.session.expires_at!)
        .user(authResponse.user)
        .build();

      asyncLocalStorage.getStore.mockReturnValue(store);

      authService.loginWithPassword.mockResolvedValue(authResponse);

      const response = await authController.loginWithPassword(loginRequestDto);

      expect(authService.loginWithPassword).toHaveBeenNthCalledWith<
        Parameters<AuthService['loginWithPassword']>
      >(1, loginRequestDto);

      expect(response).toEqual(AppResponseDto.Successful.ok(responseDto));
    });
  });

  describe('POST /auth/logout > logout', () => {
    const logoutPath = '/auth/logout';

    it('AuthService의 logout을 호출하고 결과를 반환해야 한다', async () => {
      const bearerToken = 'jwt';

      asyncLocalStorage.getStore.mockReturnValue(
        storeWithBearerAuthHeader({ path: logoutPath, jwt: bearerToken }),
      );

      const response = await authController.logout();

      expect(authService.logout).toHaveBeenNthCalledWith<
        Parameters<AuthService['logout']>
      >(1, bearerToken);

      expect(response).toEqual(AppResponseDto.Successful.noContent());
    });
  });

  describe('GET /auth/profile > getUserProfile', () => {
    const profilePath = '/auth/profile';

    it('AuthService의 getUser를 호출하고 결과를 반환해야 한다', async () => {
      const bearerToken = 'jwt';

      const filter = createBuilder<AuthFilter.JwtFilter>()
        .jwt(bearerToken)
        .build();

      asyncLocalStorage.getStore.mockReturnValue(
        storeWithBearerAuthHeader({ path: profilePath, jwt: bearerToken }),
      );

      authService.getUser.mockResolvedValue(appUser);

      const response = await authController.getUserProfile();

      expect(authService.getUser).toHaveBeenNthCalledWith<
        Parameters<AuthService['getUser']>
      >(1, filter);

      expect(response).toEqual(AppResponseDto.Successful.ok(appUser));
    });

    it('유저를 찾지 못하면 NotFoundException이 발생해야 한다', async () => {
      const bearerToken = 'jwt';

      const filter = createBuilder<AuthFilter.JwtFilter>()
        .jwt(bearerToken)
        .build();

      asyncLocalStorage.getStore.mockReturnValue(
        storeWithBearerAuthHeader({ path: profilePath, jwt: bearerToken }),
      );

      authService.getUser.mockResolvedValue(null);

      await expect(authController.getUserProfile()).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(authService.getUser).toHaveBeenNthCalledWith<
        Parameters<AuthService['getUser']>
      >(1, filter);
    });
  });

  describe('POST /auth/refresh > refreshAccessToken', () => {
    it('AuthService의 refreshAccessToken을 호출하고 결과를 반환해야 한다', async () => {
      const refreshAccessTokenRequestDto =
        createBuilder<RefreshAccessTokenRequestDto>()
          .refreshToken('refreshToken')
          .build();

      const authResponse = createBuilder<SupabaseServiceAuthResponse>()
        .user(appUser)
        .session({
          access_token: 'new_accessToken',
          refresh_token: 'new_refreshToken',
          user: { id: appUser.id, email: appUser.email },
          token_type: AUTH_HEADER_TOKEN_TYPE.Bearer,
          expires_at: TemporalUnits.convert.secondToMilliSecond(
            TemporalUnits.of('second', 300),
          ),
          expires_in: 300,
        } as SupabaseSession<TemporalUnit.MilliSecond>)
        .build();

      const responseDto = createBuilder<RefreshAccessTokenResponseDto>()
        .accessToken(authResponse.session.access_token)
        .refreshToken(authResponse.session.refresh_token)
        .expiresAt(authResponse.session.expires_at!)
        .user(authResponse.user)
        .build();

      authService.refreshAccessToken.mockResolvedValue(authResponse);

      const response = await authController.refreshAccessToken(
        refreshAccessTokenRequestDto,
      );

      expect(authService.refreshAccessToken).toHaveBeenNthCalledWith<
        Parameters<AuthService['refreshAccessToken']>
      >(1, refreshAccessTokenRequestDto);

      expect(response).toEqual(AppResponseDto.Successful.ok(responseDto));
    });
  });
});
