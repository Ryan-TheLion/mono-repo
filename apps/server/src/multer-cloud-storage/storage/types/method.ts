import {
  type MulterCloudStorageFile,
  type MulterCloudStorageFileContext,
} from '.';

export type HandleFile = ({
  req,
  file,
}: MulterCloudStorageFileContext.Staging) =>
  | MulterCloudStorageFile.Uploaded
  | Promise<MulterCloudStorageFile.Uploaded>;

export type RemoveFile = ({
  req,
  file,
}: MulterCloudStorageFileContext.Uploaded) => void | Promise<void>;

export type GenerateStorageFileKey = ({
  req,
  file,
}: MulterCloudStorageFileContext.Initial) => string | Promise<string>;

export type FileFilter = ({
  req,
  file,
}: MulterCloudStorageFileContext.FileWithoutStream<MulterCloudStorageFile.Initial>) =>
  | boolean
  | Promise<boolean>;
