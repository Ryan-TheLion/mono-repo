import {
  type Session,
  type SupabaseClient,
  type WeakPassword,
} from '@supabase/supabase-js';
import { type LoginCredential, type ProfileResponseDto } from 'src/auth/dto';
import { type TemporalUnitValues, type TemporalUnit } from 'src/common/types';

type OmitClient<Fn> = Fn extends (
  client: SupabaseClient,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;

export type SupabaseSession<
  K extends TemporalUnitValues = TemporalUnit.Second,
> = K extends TemporalUnit.Second
  ? Session
  : Omit<Session, 'expires_at'> & { expires_at?: TemporalUnit.MilliSecond };

export type LoginWithPassword = (
  client: SupabaseClient,
  { email, password }: LoginCredential,
) => Promise<{
  user: ProfileResponseDto;
  session: SupabaseSession<TemporalUnit.MilliSecond>;
  weakPassword?: WeakPassword;
}>;

export type Logout = (client: SupabaseClient, jwt: string) => Promise<void>;

export type GetUser = (
  client: SupabaseClient,
  filter: {
    jwt: string;
  },
) => Promise<ProfileResponseDto | null>;

export type GetSessionUser = (
  client: SupabaseClient,
) => Promise<ProfileResponseDto | null>;

export type RefreshAccessToken = (
  client: SupabaseClient,
  refreshToken: string,
) => Promise<{
  user: ProfileResponseDto;
  session: SupabaseSession<TemporalUnit.MilliSecond>;
}>;

export interface SupabaseServiceMethods {
  loginWithPassword: OmitClient<LoginWithPassword>;
  logout: OmitClient<Logout>;
  getUser: OmitClient<GetUser>;
  getSessionUser: OmitClient<GetSessionUser>;
  refreshAccessToken: OmitClient<RefreshAccessToken>;
}
