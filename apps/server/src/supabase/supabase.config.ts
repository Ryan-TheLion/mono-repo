import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import {
  envBooleanPassthrough,
  envNumberPassthrough,
  isKebabCase,
} from 'src/common/utils';
import z from 'zod';

export type SupabaseConfig = z.infer<typeof supabaseConfigSchema>;

const supabaseConfigSchema = z.object({
  projectUrl: z.url({
    protocol: /^https$/,
    hostname: /\.supabase\.co$/,
  }),
  secretKey: z.templateLiteral(['sb_secret_', z.string()]),
  cookie: z.object({
    name: z.string().refine((str) => isKebabCase(str).matched, {
      error: '케밥케이스(kebab-case) 문자열이 아닙니다',
    }),
    domain: z.optional(z.hostname()),
    secure: z.optional(z.boolean()),
    httpOnly: z.optional(z.boolean()),
    maxAge: z
      .number()
      .refine((num) => num > 0, {
        error: '0보다 큰 정수가 아닙니다',
        abort: true,
      })
      .refine((num) => Number.isSafeInteger(num), {
        error: '유효한 범위의 정수가 아닙니다',
      }),
  }),
});

export const supabaseConfig = registerAs('supabase', () => {
  const { data: config, error } = supabaseConfigSchema.safeParse({
    projectUrl: process.env['SUPABASE_PROJECT_URL'],
    secretKey: process.env['SUPABASE_SECRET_KEY'],
    cookie: {
      name: process.env['SUPABASE_COOKIE_NAME'],
      domain: process.env['SUPABASE_COOKIE_DOMAIN'],
      secure: envBooleanPassthrough(process.env['SUPABASE_COOKIE_SECURE']),
      httpOnly: envBooleanPassthrough(process.env['SUPABASE_COOKIE_HTTP_ONLY']),
      maxAge: envNumberPassthrough(process.env['SUPABASE_COOKIE_MAXAGE']),
    },
  });

  if (error) {
    error.issues.forEach((iss) =>
      Logger.error(`<${iss.path.join('.')}> ${iss.message}`, `supabase config`),
    );

    throw error;
  }

  return config;
});
