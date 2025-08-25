import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import bootStrapConfig from './bootstrap.config';
import { supabaseConfig } from 'src/supabase/supabase.config';
import { smtpConfig } from 'src/mail/smtp/smtp.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bootStrapConfig, supabaseConfig, smtpConfig],
    }),
  ],
})
export class CommonModule {}
