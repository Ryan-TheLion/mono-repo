import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ProfileResponseDto } from './profile.dto';

export class LoginWithPasswordRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginWithPasswordResponseDto {
  accessToken: string;

  refreshToken: string;

  expiresAt: number;

  user: ProfileResponseDto;
}
