import { Injectable } from '@nestjs/common';
import { SmtpService } from './smtp/smtp.service';
import { ImapService } from './imap/imap.service';

@Injectable()
export class MailService {
  constructor(
    private readonly smtpService: SmtpService,
    private readonly imapService: ImapService,
  ) {}
}
