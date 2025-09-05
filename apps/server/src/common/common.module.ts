import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import bootStrapConfig from './bootstrap.config';
import { supabaseConfig } from 'src/supabase/supabase.config';
import { smtpConfig } from 'src/mail/smtp/smtp.config';
import { cloudflareR2Config } from 'src/cloudflare-r2/cloudflare-r2.config';
import { imapConfig } from 'src/mail/imap/imap.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        bootStrapConfig,
        supabaseConfig,
        smtpConfig,
        imapConfig,
        cloudflareR2Config,
      ],
    }),
  ],
})
export class CommonModule {}
