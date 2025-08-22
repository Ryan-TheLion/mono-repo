import { type SupabaseSession } from 'src/supabase/types/client-methods';
import { ProfileResponseDto } from './profile.dto';
import { type TemporalUnit } from 'src/common/types';
import { AuthError } from '@supabase/supabase-js';

export class SupabaseServiceAuthResponse {
  user: ProfileResponseDto;

  session: SupabaseSession<TemporalUnit.MilliSecond>;
}

export class SupabaseSignoutResponse {
  error: AuthError | null;
}

export class SupabaseAdminSignoutResponse extends SupabaseSignoutResponse {
  data: null;
}
