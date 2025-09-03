import { Request } from 'express';
import { type MulterCloudStorageFile } from '.';

type AnyFile = MulterCloudStorageFile.Any | Express.Multer.File;

type Context<
  File extends AnyFile | MulterCloudStorageFile.WithoutStream<AnyFile>,
> = {
  req: Request;
  file: File;
};

export type Multer = Context<Express.Multer.File>;

export type FileWithoutStream<File extends AnyFile = Express.Multer.File> =
  Context<MulterCloudStorageFile.WithoutStream<File>>;

export type Initial = Context<MulterCloudStorageFile.Initial>;

export type Staging = Context<MulterCloudStorageFile.Staging>;

export type Uploaded = Context<MulterCloudStorageFile.Uploaded>;
