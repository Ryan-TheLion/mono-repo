import { IsNotEmpty, IsString } from 'class-validator';
import { ProfileResponseDto } from './profile.dto';

export class RefreshAccessTokenRequestDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshAccessTokenResponseDto {
  accessToken: string;

  refreshToken: string;

  expiresAt: number;

  user: ProfileResponseDto;
}
