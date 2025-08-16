import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { AsyncLocalStorageModule } from 'src/async-local-storage/async-local-storage.module';

// TODO: DI - passport, supabase exception filter
@Module({
  imports: [JwtModule.register({ global: true }), AsyncLocalStorageModule],
  providers: [AuthService, SupabaseService],
  controllers: [AuthController],
})
export class AuthModule {}
