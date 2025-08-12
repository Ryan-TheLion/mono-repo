import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// TODO: DI - supabase service, passport, supabase exception filter
@Module({
  imports: [JwtModule.register({ global: true })],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
