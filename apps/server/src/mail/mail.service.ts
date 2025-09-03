import { Injectable } from '@nestjs/common';
import { SmtpService } from './smtp/smtp.service';
import { ImapService } from './imap/imap.service';
import { SendMailRequestDto } from './dto/send-mail.dto';
import { MailCredentialDto } from './dto/credential.dto';
import { type Attachment } from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly smtpService: SmtpService,
    private readonly imapService: ImapService,
  ) {}

  async sendMail(
    credential: MailCredentialDto,
    dto: SendMailRequestDto,
    attachments?: Attachment[],
  ) {
    return await this.smtpService.getMailer(credential).sendMail({
      ...dto,
      ...(attachments?.length && { attachments }),
    });
  }
}
