import { IsNotEmpty, IsString } from 'class-validator';
import { ProfileResponseDto } from './profile.dto';
import { type TemporalUnit } from 'src/common/types';

export class RefreshAccessTokenRequestDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshAccessTokenResponseDto {
  accessToken: string;

  refreshToken: string;

  expiresAt: TemporalUnit.MilliSecond;

  user: ProfileResponseDto;
}
