import { Controller, Get, Post } from '@nestjs/common';
import { AppResponseDto } from 'src/common/dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO: 실제 DTO와 서비스 반환값을 활용하여 응답 구현
  @Post('login')
  async loginWithPassword(): Promise<AppResponseDto> {
    const response = await this.authService.loginWithPassword();

    console.log(response);

    return Promise.resolve(AppResponseDto.Successful.ok());
  }

  // TODO: 실제 DTO와 서비스 반환값을 활용하여 응답 구현
  @Post('logout')
  async logout(): Promise<AppResponseDto> {
    const response = await this.authService.logout();

    console.log(response);

    return Promise.resolve(AppResponseDto.Successful.noContent());
  }

  // TODO: 실제 DTO와 서비스 반환값을 활용하여 응답 구현
  @Get('profile')
  async getUserProfile(): Promise<AppResponseDto> {
    const response = await this.authService.getUserFromJwt();

    console.log(response);

    return Promise.resolve(AppResponseDto.Successful.ok());
  }

  // TODO: 실제 DTO와 서비스 반환값을 활용하여 응답 구현
  @Post('refresh')
  async refreshAccessToken(): Promise<AppResponseDto> {
    const response = await this.authService.refreshAccessToken();

    console.log(response);

    return Promise.resolve(AppResponseDto.Successful.ok());
  }
}
