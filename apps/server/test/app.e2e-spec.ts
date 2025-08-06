import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 기본 환경 설정 단계로 지금 시점에서 테스트 할 콘트롤러 없음
  it('/ (GET) NotFound', () => {
    return request(app.getHttpServer()).get('/').expect(HttpStatus.NOT_FOUND);
  });
});
