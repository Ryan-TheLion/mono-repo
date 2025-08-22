import { Injectable } from '@nestjs/common';
import {
  AuthFilter,
  LoginWithPasswordRequestDto,
  RefreshAccessTokenRequestDto,
} from './dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async loginWithPassword(dto: LoginWithPasswordRequestDto) {
    return await this.supabaseService
      .getClient()
      .loginWithPassword({ email: dto.email, password: dto.password });
  }

  async logout(jwt: string) {
    return await this.supabaseService.getClient().logout(jwt);
  }

  async getUser(filter: AuthFilter.JwtFilter) {
    return await this.supabaseService.getClient().getUser({ jwt: filter.jwt });
  }

  async getSessionUser() {
    return await this.supabaseService.getClient().getSessionUser();
  }

  async refreshAccessToken(dto: RefreshAccessTokenRequestDto) {
    return await this.supabaseService
      .getClient()
      .refreshAccessToken(dto.refreshToken);
  }
}
