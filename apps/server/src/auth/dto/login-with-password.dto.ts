import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ProfileResponseDto } from './profile.dto';
import { type TemporalUnit } from 'src/common/types';

export class LoginCredential {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginWithPasswordRequestDto extends LoginCredential {}

export class LoginWithPasswordResponseDto {
  accessToken: string;

  refreshToken: string;

  expiresAt: TemporalUnit.MilliSecond;

  user: ProfileResponseDto;
}
