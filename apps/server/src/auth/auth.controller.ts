import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AppResponseDto } from 'src/common/dto';
import { AuthService } from './auth.service';
import {
  LoginWithPasswordRequestDto,
  LoginWithPasswordResponseDto,
  ProfileResponseDto,
  RefreshAccessTokenRequestDto,
  RefreshAccessTokenResponseDto,
} from './dto';
import { AsyncLocalStorage } from 'async_hooks';
import { type RequestMetaStore } from 'src/async-local-storage/types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly asyncLocalStorage: AsyncLocalStorage<RequestMetaStore>,
  ) {}

  @Post('login')
  async loginWithPassword(
    @Body() dto: LoginWithPasswordRequestDto,
  ): Promise<AppResponseDto<LoginWithPasswordResponseDto>> {
    const authHeader = this.asyncLocalStorage.getStore()!.authHeader;

    if (authHeader.type === 'Bearer' || authHeader.type === 'Basic')
      throw new BadRequestException(
        '로그인 요청에는 Authorization 헤더를 포함할 수 없습니다',
      );

    const { user, session } = await this.authService.loginWithPassword(dto);

    return Promise.resolve(
      AppResponseDto.Successful.ok<LoginWithPasswordResponseDto>({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at!,
        user,
      }),
    );
  }

  @Post('logout')
  async logout(): Promise<AppResponseDto> {
    // TODO: passport jwt 가드 적용

    const authHeader = this.asyncLocalStorage.getStore()!.authHeader;

    const bearerToken = authHeader.type === 'Bearer' ? authHeader.jwt : null;

    if (!bearerToken) throw new UnauthorizedException();

    await this.authService.logout(bearerToken);

    return Promise.resolve(AppResponseDto.Successful.noContent());
  }

  @Get('profile')
  async getUserProfile(): Promise<AppResponseDto<ProfileResponseDto>> {
    // TODO: passport jwt 가드 적용

    const authHeader = this.asyncLocalStorage.getStore()!.authHeader;

    const bearerToken = authHeader.type === 'Bearer' ? authHeader.jwt : null;

    if (!bearerToken) throw new UnauthorizedException();

    const user = await this.authService.getUser({ jwt: bearerToken });

    if (!user) throw new NotFoundException();

    return Promise.resolve(
      AppResponseDto.Successful.ok<ProfileResponseDto>(user),
    );
  }

  @Post('refresh')
  async refreshAccessToken(
    @Body() dto: RefreshAccessTokenRequestDto,
  ): Promise<AppResponseDto<RefreshAccessTokenResponseDto>> {
    const { user, session } = await this.authService.refreshAccessToken(dto);

    return Promise.resolve(
      AppResponseDto.Successful.ok<RefreshAccessTokenResponseDto>({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at!,
        user,
      }),
    );
  }
}
