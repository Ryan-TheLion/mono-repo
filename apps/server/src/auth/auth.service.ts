import { Injectable } from '@nestjs/common';
import {
  LoginWithPasswordRequestDto,
  RefreshAccessTokenRequestDto,
} from './dto';

// TODO: supabase service 의존성 주입
@Injectable()
export class AuthService {
  // TODO: supabase service로 요청
  async loginWithPassword(dto: LoginWithPasswordRequestDto) {
    console.log({ dto });

    return Promise.resolve('login');
  }

  // TODO: supabase service로 요청
  async logout() {
    return Promise.resolve('logout');
  }

  // TODO: supabase service로 요청
  async getUserFromJwt() {
    return Promise.resolve('user');
  }

  // TODO: supabase service로 요청
  async refreshAccessToken(dto: RefreshAccessTokenRequestDto) {
    console.log({ dto });

    return Promise.resolve('refreshAccessToken');
  }
}
