import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AsyncLocalStorageModule } from './async-local-storage/async-local-storage.module';
import { RequestMetaAsyncLocalStorageMiddleware } from './async-local-storage/middleware';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import {
  HttpExceptionFilter,
  ThrowedErrorExceptionFilter,
} from './common/exception-filter';

@Module({
  imports: [
    CommonModule,
    AsyncLocalStorageModule,
    JwtModule.register({ global: true }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ThrowedErrorExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMetaAsyncLocalStorageMiddleware).forRoutes('*path');
  }
}
