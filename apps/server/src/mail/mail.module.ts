import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { SmtpModule } from './smtp/smtp.module';
import { ImapModule } from './imap/imap.module';

@Module({
  imports: [SmtpModule, ImapModule],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
