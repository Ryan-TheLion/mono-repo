import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigType, registerAs } from '@nestjs/config';

export type BootStrapConfig = ConfigType<typeof bootStrapConfig>;

const bootStrapConfig = registerAs('bootStrap', () => {
  const origin = (() => {
    if (process.env.CORS_ORIGIN === undefined) return undefined;

    const originEnv = new Function(`return ${process.env.CORS_ORIGIN}`)();

    if (!Array.isArray(originEnv))
      throw new Error('origin은 배열 형식으로 설정해주세요');

    if (
      !originEnv.every(
        (value) => typeof value === 'string' || value instanceof RegExp,
      )
    )
      throw new Error(
        '개별 origin은 문자열이나 RegExp 리터럴 형식만 가능합니다',
      );

    return originEnv;
  })();

  const config = {
    port: process.env.PORT ? Number(process.env.PORT) : 8000,
    origin,
    cors: {
      credentials: true,
    } satisfies CorsOptions as CorsOptions,
  };

  return config;
});

export default bootStrapConfig;
