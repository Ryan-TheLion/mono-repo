import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigType, registerAs } from '@nestjs/config';
import {
  isArrayFormat,
  isBooleanFormat,
  isNumberFormat,
  isRegExpFormat,
} from './utils';

type StaticCorsOrigin = boolean | string | RegExp | (string | RegExp)[];

export type BootStrapConfig = ConfigType<typeof bootStrapConfig>;

const bootStrapConfig = registerAs('bootStrap', async () => {
  const origin = await loadCorsOriginsEnv();

  const isPort = isNumberFormat(process.env.PORT ?? '');

  const config = {
    port: isPort.matched ? isPort.resolvedValue : 8000,
    cors: {
      origin,
      credentials: true,
    } satisfies CorsOptions as CorsOptions,
  };

  return config;
});

const loadCorsOriginsEnv = async (): Promise<StaticCorsOrigin | undefined> => {
  const envField = process.env['CORS_ORIGINS'];

  if (!envField) return undefined;

  const matchedFormat = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/require-await
    (async (format: string) => {
      const isBoolean = isBooleanFormat(format);

      if (isBoolean.matched) return isBoolean.resolvedValue;

      return null;
    })(envField),
    // eslint-disable-next-line @typescript-eslint/require-await
    (async (format: string) => {
      const isRegExp = isRegExpFormat(format);

      if (isRegExp.matched) return isRegExp.regexp;

      return null;
    })(envField),
    // eslint-disable-next-line @typescript-eslint/require-await
    (async (format: string) => {
      const isArray = isArrayFormat(format);

      if (isArray.matched) {
        return JSON.parse(format, (key, value) => {
          if (key === '') return value as Array<string | RegExp>;

          const isRegExp = isRegExpFormat(value as string);

          if (isRegExp.matched) return isRegExp.regexp;

          return value as string;
        }) as Array<string | RegExp>;
      }

      return null;
    })(envField),
  ]);

  const matched = matchedFormat.find((value) => value != null);

  if (matched) return matched;

  return envField;
};

export default bootStrapConfig;
