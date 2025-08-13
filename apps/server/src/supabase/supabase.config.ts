import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { isBooleanFormat } from 'src/common/utils';
import z from 'zod';

export type SupabaseConfig = z.infer<typeof supabaseConfigSchema>;

const supabaseConfigSchema = z.object({
  projectUrl: z.url({
    protocol: /^https$/,
    hostname: /\.supabase\.co$/,
  }),
  publishableKey: z.templateLiteral(['sb_publishable_', z.string()]),
  secretKey: z.templateLiteral(['sb_secret_', z.string()]),
  cookie: z.object({
    name: z.optional(z.string().min(1)),
    domain: z.optional(z.hostname()),
    secure: z.optional(z.boolean()),
    httpOnly: z.optional(z.boolean()),
  }),
});

export const supabaseConfig = registerAs('supabase', () => {
  const { data: config, error } = supabaseConfigSchema.safeParse({
    projectUrl: process.env['SUPABASE_PROJECT_URL'],
    publishableKey: process.env['SUPABASE_PUBLISHABLE_KEY'],
    secretKey: process.env['SUPABASE_SECRET_KEY'],
    cookie: {
      name: process.env['SUPABASE_COOKIE_NAME'],
      domain: process.env['SUPABASE_COOKIE_DOMAIN'],
      secure: ((envField: string | undefined) => {
        if (!envField) return undefined;

        const isBoolean = isBooleanFormat(envField);

        if (isBoolean.matched) return isBoolean.resolvedValue;

        // 유효하지 않은 스키마로 에러를 발생시키기 위해 env 문자열 그대로 반환
        return envField;
      })(process.env['SUPABASE_COOKIE_SECURE']),
      httpOnly: process.env['SUPABASE_COOKIE_HTTP_ONLY'],
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
