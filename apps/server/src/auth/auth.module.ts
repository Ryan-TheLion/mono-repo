import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { AsyncLocalStorageModule } from 'src/async-local-storage/async-local-storage.module';
import { SupabaseJwksStrategy } from 'src/supabase/strategy/jwks.strategy';

@Module({
  imports: [JwtModule.register({ global: true }), AsyncLocalStorageModule],
  providers: [AuthService, SupabaseService, SupabaseJwksStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
