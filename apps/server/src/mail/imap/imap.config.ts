import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { envNumberPassthrough } from 'src/common/utils';
import { isEmailPort } from '../port';
import z from 'zod';

export type ImapConfig = z.infer<typeof imapConfigSchema>;

const imapConfigSchema = z.object({
  host: z.hostname(),
  port: z.number().refine((port) => isEmailPort(port), {
    error: '유효한 email 포트가 아닙니다',
  }),
});

export const imapConfig = registerAs('imap', () => {
  const { data: config, error } = imapConfigSchema.safeParse({
    host: process.env['IMAP_HOST'],
    port: envNumberPassthrough(process.env['IMAP_PORT']),
  });

  if (error) {
    error.issues.forEach((iss) =>
      Logger.error(`<${iss.path.join('.')}> ${iss.message}`, `imap config`),
    );

    throw error;
  }

  return config;
});
