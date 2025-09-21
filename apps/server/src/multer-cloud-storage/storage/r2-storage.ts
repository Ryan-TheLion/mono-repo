import { Injectable } from '@nestjs/common';
import { type MulterCloudStorageMethod } from './types';
import { MulterCloudStorage } from './multer-cloud-storage.abstract';
import { CloudflareR2Service } from 'src/cloudflare-r2/cloudflare-r2.service';
import { createBuilder } from 'src/common/utils';
import { type CloudflareR2Config } from 'src/cloudflare-r2/cloudflare-r2.config';
import * as path from 'path';

@Injectable()
export class MulterR2Storage extends MulterCloudStorage {
  constructor(private readonly r2Service: CloudflareR2Service) {
    super();
  }

  handleFile: MulterCloudStorageMethod.HandleFile = async ({ file }) => {
    const pathConfig = createBuilder<{
      bucketKey: keyof CloudflareR2Config['buckets'];
      objectKey: string;
    }>()
      .bucketKey('app')
      .objectKey(file.key)
      .build();

    await this.r2Service.putObject(pathConfig.bucketKey, pathConfig.objectKey, {
      Body: file.stream,
      ContentType: file.mimetype,
    });

    const url = this.r2Service.getDomainBucketUrl(
      pathConfig.bucketKey,
      pathConfig.objectKey,
    );

    return {
      ...file,
      url,
    };
  };

  handleRemoveFile: MulterCloudStorageMethod.RemoveFile = async ({ file }) => {
    await this.r2Service.deleteObject('app', file.key);
  };

  generateStorageFileKey: MulterCloudStorageMethod.GenerateStorageFileKey = ({
    file,
  }) => {
    const fileExtension = path.extname(file.originalname);

    return `${crypto.randomUUID()}${fileExtension}`;
  };
}
