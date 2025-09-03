import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { AppResponseDto } from 'src/common/dto';
import { SendMailRequestDto, SendMailResponseDto } from './dto/send-mail.dto';
import { SupabaseJwksGuard } from 'src/supabase/strategy';
import { User } from 'src/auth/decorator';
import { ProfileResponseDto } from 'src/auth/dto';
import { MailOauthIntrospectResponseDto } from './dto/oauth-introspect.dto';
import { MailCredential } from './decorator';
import { MailCredentialDto } from './dto/credential.dto';
import { RequireContentType } from 'src/common/decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { type Attachment } from 'nodemailer/lib/mailer';
import { type MulterCloudStorageFile } from 'src/multer-cloud-storage/storage/types';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(SupabaseJwksGuard)
  @Get('oauth2/introspect')
  auth(
    @User() user: ProfileResponseDto,
  ): AppResponseDto<MailOauthIntrospectResponseDto> {
    return AppResponseDto.Successful.ok<MailOauthIntrospectResponseDto>({
      email: user.email,
    });
  }

  @RequireContentType('multipart/form-data')
  @UseGuards(SupabaseJwksGuard)
  @UseInterceptors(FilesInterceptor('attachments'))
  @Post('send')
  async sendMail(
    @MailCredential() credential: MailCredentialDto,
    @Body() dto: SendMailRequestDto,
    @UploadedFiles()
    attachments: MulterCloudStorageFile.Uploaded[],
  ): Promise<AppResponseDto<SendMailResponseDto>> {
    const mailAttachments = attachments.map<Attachment>((file) => {
      return { filename: file.originalname, path: file.url };
    });

    const { messageId, accepted, rejected } = await this.mailService.sendMail(
      credential,
      dto,
      mailAttachments,
    );

    const status: SendMailResponseDto['status'] = (() => {
      if (accepted.length) {
        return rejected.length ? 'partialAccepted' : 'success';
      }

      return 'rejected';
    })();

    return AppResponseDto.Successful.ok<SendMailResponseDto>({
      messageId,
      status,
      accepted,
      rejected,
    });
  }
}
