import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import z from 'zod';

export type CloudflareR2Config = z.infer<typeof cloudflareR2ConfigSchema>;

const bucketKeySchema = z.union([z.literal('app')]);

const bucketMetaSchema = z.object({
  name: z.string(),
  url: z.url(),
});

const cloudflareR2ConfigSchema = z.object({
  endPoint: z.url(),
  accountId: z.string(),
  credentials: z.object({
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
  }),
  buckets: z.record(bucketKeySchema, bucketMetaSchema),
});

export const cloudflareR2Config = registerAs('cloudflareR2', () => {
  const { data: config, error } = cloudflareR2ConfigSchema.safeParse({
    endPoint: process.env['R2_ENDPOINT'],
    accountId: process.env['R2_ACCOUNT_ID'],
    credentials: {
      accessKeyId: process.env['R2_ACCESS_KEY_ID'],
      secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'],
    },
    buckets: {
      app: {
        name: process.env['R2_APP_BUCKET_NAME'],
        url: process.env['R2_APP_BUCKET_URL'],
      },
    },
  });

  if (error) {
    error.issues.forEach((iss) =>
      Logger.error(
        `<${iss.path.join('.')}> ${iss.message}`,
        `cloudflare R2 config`,
      ),
    );

    throw error;
  }

  return config;
});
