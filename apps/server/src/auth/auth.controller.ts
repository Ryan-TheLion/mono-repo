import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppResponseDto } from 'src/common/dto';
import { AuthService } from './auth.service';
import {
  LoginWithPasswordRequestDto,
  LoginWithPasswordResponseDto,
  ProfileResponseDto,
  RefreshAccessTokenRequestDto,
  RefreshAccessTokenResponseDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO: 실제 서비스 반환값을 활용하여 응답 구현
  @Post('login')
  async loginWithPassword(
    @Body() dto: LoginWithPasswordRequestDto,
  ): Promise<AppResponseDto<LoginWithPasswordResponseDto>> {
    const response = await this.authService.loginWithPassword(dto);

    console.log(response);

    return Promise.resolve(
      AppResponseDto.Successful.ok<LoginWithPasswordResponseDto>({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        expiresAt: Date.now() + 1000 * 60 * 60,
        user: {
          id: '7f81b19a-9c76-4a4e-8d82-8c1d5f8a619c',
          email: 'mock@emai.com',
          phone: null,
          user_role: 'user',
        },
      }),
    );
  }

  // TODO: 실제 서비스 반환값을 활용하여 응답 구현
  @Post('logout')
  async logout(): Promise<AppResponseDto> {
    const response = await this.authService.logout();

    console.log(response);

    return Promise.resolve(AppResponseDto.Successful.noContent());
  }

  // TODO: 실제 서비스 반환값을 활용하여 응답 구현
  @Get('profile')
  async getUserProfile(): Promise<AppResponseDto<ProfileResponseDto>> {
    const response = await this.authService.getUserFromJwt();

    console.log(response);

    return Promise.resolve(
      AppResponseDto.Successful.ok<ProfileResponseDto>({
        id: '7f81b19a-9c76-4a4e-8d82-8c1d5f8a619c',
        email: 'mock@emai.com',
        phone: null,
        user_role: 'user',
      }),
    );
  }

  // TODO: 실제 서비스 반환값을 활용하여 응답 구현
  @Post('refresh')
  async refreshAccessToken(
    @Body() dto: RefreshAccessTokenRequestDto,
  ): Promise<AppResponseDto<RefreshAccessTokenResponseDto>> {
    const response = await this.authService.refreshAccessToken(dto);

    console.log(response);

    return Promise.resolve(
      AppResponseDto.Successful.ok<RefreshAccessTokenResponseDto>({
        accessToken: 'new_accessToken',
        refreshToken: 'new_refreshToken',
        expiresAt: Date.now() + 1000 * 60 * 60,
        user: {
          id: '7f81b19a-9c76-4a4e-8d82-8c1d5f8a619c',
          email: 'mock@emai.com',
          phone: null,
          user_role: 'user',
        },
      }),
    );
  }
}
