import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
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
import {
  reqMetaAuthHeaderPayloadAs,
  type RequestMetaStore,
} from 'src/async-local-storage/types';
import { SupabaseJwksGuard } from 'src/supabase/strategy';
import { type TokenType } from 'src/common/types';

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

    return AppResponseDto.Successful.ok<LoginWithPasswordResponseDto>({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at!,
      user,
    });
  }

  @UseGuards(SupabaseJwksGuard)
  @Post('logout')
  async logout(): Promise<AppResponseDto> {
    const bearerToken = reqMetaAuthHeaderPayloadAs<TokenType.Bearer>(
      this.asyncLocalStorage.getStore()!.authHeader,
    ).jwt;

    await this.authService.logout(bearerToken);

    return AppResponseDto.Successful.noContent();
  }

  @UseGuards(SupabaseJwksGuard)
  @Get('profile')
  async getUserProfile(): Promise<AppResponseDto<ProfileResponseDto>> {
    const bearerToken = reqMetaAuthHeaderPayloadAs<TokenType.Bearer>(
      this.asyncLocalStorage.getStore()!.authHeader,
    ).jwt;

    const user = await this.authService.getUser({ jwt: bearerToken });

    if (!user) throw new NotFoundException();

    return AppResponseDto.Successful.ok<ProfileResponseDto>(user);
  }

  @Post('refresh')
  async refreshAccessToken(
    @Body() dto: RefreshAccessTokenRequestDto,
  ): Promise<AppResponseDto<RefreshAccessTokenResponseDto>> {
    const { user, session } = await this.authService.refreshAccessToken(dto);

    return AppResponseDto.Successful.ok<RefreshAccessTokenResponseDto>({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at!,
      user,
    });
  }
}
