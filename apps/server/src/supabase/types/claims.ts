import {
  type JwtPayload,
  type UserAppMetadata,
  type UserMetadata,
  type AMREntry,
} from '@supabase/supabase-js';
import { type ProfileResponseDto } from 'src/auth/dto';

/**
 * Supabase 기본 JWTs claims 타입
 *
 * - RequiredClaims + OptionalClaims + SpecialClaims
 *
 * @see RequiredClaims {@link https://supabase.com/docs/guides/auth/jwt-fields#required-claims}
 * @see OptionalClaims {@link https://supabase.com/docs/guides/auth/jwt-fields#optional-claims}
 * @see SpecialClaims {@link https://supabase.com/docs/guides/auth/jwt-fields#special-claims}
 */
export type SupabaseClaims = RequiredClaims &
  Partial<OptionalClaims> &
  Partial<SpecialClaims>;

/**
 * App에서 사용하는 Supabase JWTs claims 타입(custom claims 반영)
 */
export type AppSupabaseClaims = SupabaseClaims & {
  user_profile: ProfileResponseDto;
};

interface RequiredClaims extends JwtPayload {
  email: string;
  phone: string;
  is_anonymous: boolean;
}

interface OptionalClaims {
  jti: string;
  nbf: number;
  app_metadata: UserAppMetadata;
  user_metadata: UserMetadata;
  amr: AMREntry[];
}

interface SpecialClaims {
  ref: string;
}
