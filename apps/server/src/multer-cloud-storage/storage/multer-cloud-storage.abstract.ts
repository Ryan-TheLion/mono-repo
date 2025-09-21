import {
  type MulterStorageEngine,
  type MulterCloudStorageFile,
  type MulterCloudStorageMethod,
  type MulterLibOptions,
} from './types';
import { BadRequestException } from '@nestjs/common';

export interface MulterCloudStorageOptions {
  limits?: MulterLibOptions.Limits;
}

export abstract class MulterCloudStorage
  implements MulterStorageEngine.CloudStorage
{
  constructor(options: MulterCloudStorageOptions = {}) {
    this.multerOptions = {
      ...this.multerOptions,
      ...options,
    };
  }

  multerOptions: MulterCloudStorageOptions = {};

  /**
   * Multer StorageEngine `_handleFile` 구현체
   *
   * - 하위 클래스에서는 handleFile 메서드를 구현
   *
   * @readonly
   */
  get _handleFile(): Readonly<MulterStorageEngine.Multer>['_handleFile'] {
    return (req, file, callback) => {
      void (async () => {
        try {
          const initialFile: MulterCloudStorageFile.Initial = {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            stream: file.stream,
          };

          const key = await this.generateStorageFileKey({
            req,
            file: initialFile,
          });

          const multerCloudStorageFile = await this.handleFile({
            req,
            file: {
              ...initialFile,
              key,
            },
          });

          callback(null, multerCloudStorageFile);
        } catch (error) {
          callback(error);
        }
      })();
    };
  }

  /**
   * Multer StorageEngine `_removeFile` 구현체
   *
   * - 하위 클래스에서는 removeFile 메서드를 구현
   *
   * @readonly
   */
  get _removeFile(): Readonly<MulterStorageEngine.Multer>['_removeFile'] {
    return (req, file, callback) => {
      void (async () => {
        try {
          await this.handleRemoveFile({
            req,
            file: file as unknown as MulterCloudStorageFile.Uploaded,
          });

          callback(null);
        } catch (error) {
          callback(error as Error);
        }
      })();
    };
  }

  /**
   * Multer fileFilter Option 구현체
   *
   * - 하위 클래스에서는 `fileFilter` 메서드를 구현
   *
   * @readonly
   */
  get _fileFilter(): Readonly<MulterStorageEngine.CloudStorage>['_fileFilter'] {
    return (req, file, callback) => {
      void (async () => {
        try {
          if (this.fileFilter != null) {
            const accepted = await this.fileFilter({ req, file });

            return callback(
              !accepted
                ? new BadRequestException('유효하지 않은 파일입니다')
                : null,
              accepted,
            );
          }

          callback(null, true);
        } catch (error) {
          callback(error as Error, false);
        }
      })();
    };
  }

  abstract handleFile: MulterCloudStorageMethod.HandleFile;

  abstract handleRemoveFile: MulterCloudStorageMethod.RemoveFile;

  abstract generateStorageFileKey: MulterCloudStorageMethod.GenerateStorageFileKey;

  /**
   * (Optional) file filter 를 적용하고 싶은 경우 구현
   */
  fileFilter: MulterCloudStorageMethod.FileFilter;
}
