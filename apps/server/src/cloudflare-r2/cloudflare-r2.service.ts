import { Inject, Injectable } from '@nestjs/common';
import {
  cloudflareR2Config,
  type CloudflareR2Config,
} from './cloudflare-r2.config';
import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  type PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { type OptionalKeys } from 'src/common/types';
import { Upload } from '@aws-sdk/lib-storage';

type BucketKey = keyof CloudflareR2Config['buckets'];

@Injectable()
export class CloudflareR2Service {
  s3Client: S3Client;

  constructor(
    @Inject(cloudflareR2Config.KEY) private readonly config: CloudflareR2Config,
  ) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: config.endPoint,
      credentials: config.credentials,
    });
  }

  private getBucketMeta = (bucketKey: BucketKey) => {
    return this.config.buckets[bucketKey];
  };

  getDomainBucketUrl = (bucketKey: BucketKey, objectKey: string) => {
    const bucket = this.getBucketMeta(bucketKey);

    return `${bucket.url}/${objectKey}`;
  };

  putObject = async (
    bucketKey: BucketKey,
    key: string,
    options?: Pick<PutObjectCommandInput, OptionalKeys<PutObjectCommandInput>>,
  ) => {
    const bucket = this.getBucketMeta(bucketKey);

    const uploadCommand = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucket.name,
        Key: key,
        ...options,
      },
    });

    return await uploadCommand.done();
  };

  deleteObject = async (
    bucketKey: BucketKey,
    key: string,
    options?: Pick<
      DeleteObjectCommandInput,
      OptionalKeys<DeleteObjectCommandInput>
    >,
  ) => {
    const bucket = this.getBucketMeta(bucketKey);

    const deleteCommandOutput = await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket.name,
        Key: key,
        ...options,
      }),
    );

    return deleteCommandOutput;
  };
}
