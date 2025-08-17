import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type SupabaseConfig, supabaseConfig } from '../supabase.config';
import { Inject } from '@nestjs/common';
import { type AppSupabaseClaims } from '../types';
import { ProfileResponseDto } from 'src/auth/dto';

const SUPABASE_STRATEGY = 'supabase-jwks' as const;

export class SupabaseJwksGuard extends AuthGuard(SUPABASE_STRATEGY) {}

export class SupabaseJwksStrategy extends PassportStrategy(
  Strategy,
  SUPABASE_STRATEGY,
) {
  constructor(
    @Inject(supabaseConfig.KEY) private readonly config: SupabaseConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: config.jwksUrl,
        cache: true,
      }),
      ignoreExpiration: false,
    });
  }

  validate(claims: AppSupabaseClaims): ProfileResponseDto {
    return claims.user_profile;
  }
}
