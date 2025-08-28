import { Injectable } from '@nestjs/common';
import { SmtpService } from './smtp/smtp.service';
import { ImapService } from './imap/imap.service';
import { SendMailRequestDto } from './dto/send-mail.dto';
import { MailCredentialDto } from './dto/credential.dto';

@Injectable()
export class MailService {
  constructor(
    private readonly smtpService: SmtpService,
    private readonly imapService: ImapService,
  ) {}

  async sendMail(credential: MailCredentialDto, dto: SendMailRequestDto) {
    return await this.smtpService.getMailer(credential).sendMail(dto);
  }
}
