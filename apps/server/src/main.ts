import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import appBootStrapConfig, {
  type BootStrapConfig,
} from './common/bootstrap.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const bootStrapConfig = app.get<BootStrapConfig>(appBootStrapConfig.KEY);

  app.enableCors(bootStrapConfig.cors);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      disableErrorMessages: true,
    }),
  );

  await app.listen(bootStrapConfig.port);

  const appURL = new URL(await app.getUrl());

  const port = appURL.port;
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  Logger.log(
    `\nport: ${port}\nlocal timezone: ${localTimezone}`,
    'NestApplication:listen',
  );
}

void bootstrap();
