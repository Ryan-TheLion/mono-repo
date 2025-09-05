import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import {
  GetMailBoxParams,
  GetMailBoxQuery,
  GetMailBoxResponseDto,
} from './dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // TODO: 실제 service 반환 값을 활용하는 로직으로 수정
  @UseGuards(SupabaseJwksGuard)
  @Get('boxes/:box')
  async getMailBox(
    @Param() params: GetMailBoxParams,
    @Query() queries: GetMailBoxQuery,
  ): Promise<AppResponseDto<GetMailBoxResponseDto>> {
    await this.mailService.getMailBox(params.box, queries);

    return AppResponseDto.Successful.ok<GetMailBoxResponseDto>({
      mails: [],
      pagination: {
        pages: 1,
        total: 0,
        page: 1,
        size: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  }

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
