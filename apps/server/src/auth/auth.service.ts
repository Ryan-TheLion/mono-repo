import { Injectable } from '@nestjs/common';

// TODO: supabase service 의존성 주입
@Injectable()
export class AuthService {
  // TODO: supabase service로 요청
  async loginWithPassword() {
    return Promise.resolve('login');
  }

  // TODO: supabase service로 요청
  async logout() {
    return Promise.resolve('logout');
  }

  // TODO: supabase service로 요청
  async getSessionUser() {
    return Promise.resolve('sessionUser');
  }

  // TODO: supabase service로 요청
  async getUserFromJwt() {
    return Promise.resolve('user');
  }

  // TODO: supabase service로 요청
  async refreshAccessToken() {
    return Promise.resolve('refreshAccessToken');
  }
}
