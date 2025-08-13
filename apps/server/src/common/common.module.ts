import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import bootStrapConfig from './bootstrap.config';
import { supabaseConfig } from 'src/supabase/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bootStrapConfig, supabaseConfig],
    }),
  ],
})
export class CommonModule {}
