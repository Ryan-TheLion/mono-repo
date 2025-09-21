import { type StorageEngine } from 'multer';
import { type MulterCloudStorageFile, type MulterCloudStorageMethod } from '.';
import { type Request } from 'express';

export type Multer = StorageEngine;

export interface CloudStorage extends MulterStorageEngine, CloudStorageEngine {}

interface MulterStorageEngine extends StorageEngine {
  _fileFilter: (
    req: Request,
    file: MulterCloudStorageFile.WithoutStream,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => void;
}

interface CloudStorageEngine {
  handleFile: MulterCloudStorageMethod.HandleFile;
  handleRemoveFile: MulterCloudStorageMethod.RemoveFile;
  generateStorageFileKey: MulterCloudStorageMethod.GenerateStorageFileKey;
  fileFilter: MulterCloudStorageMethod.FileFilter;
}
