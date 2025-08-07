import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import bootStrapConfig from './bootstrap.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bootStrapConfig],
    }),
  ],
})
export class CommonModule {}
