import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { envNumberPassthrough } from 'src/common/utils';
import { isEmailPort } from '../port';
import z from 'zod';

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;

const smtpConfigSchema = z.object({
  host: z.hostname(),
  port: z.number().refine((port) => isEmailPort(port), {
    error: '유효한 email 포트가 아닙니다',
  }),
});

export const smtpConfig = registerAs('smtp', () => {
  const { data: config, error } = smtpConfigSchema.safeParse({
    host: process.env['SMTP_HOST'],
    port: envNumberPassthrough(process.env['SMTP_PORT']),
  });

  if (error) {
    error.issues.forEach((iss) =>
      Logger.error(`<${iss.path.join('.')}> ${iss.message}`, `smtp config`),
    );

    throw error;
  }

  return config;
});
