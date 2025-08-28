import { IsEmail, IsJWT } from 'class-validator';

export class MailCredentialDto {
  @IsEmail()
  user: string;

  @IsJWT()
  token: string;
}
