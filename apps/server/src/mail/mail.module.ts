import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { SmtpModule } from './smtp/smtp.module';
import { ImapModule } from './imap/imap.module';
import { MulterCloudStorageModule } from 'src/multer-cloud-storage/multer-cloud-storage.module';
import { MulterR2Storage } from 'src/multer-cloud-storage/storage/r2-storage';
import { CloudflareR2Service } from 'src/cloudflare-r2/cloudflare-r2.service';

@Module({
  imports: [
    SmtpModule,
    ImapModule,
    MulterCloudStorageModule.of({
      storage: MulterR2Storage,
      providers: [CloudflareR2Service],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
