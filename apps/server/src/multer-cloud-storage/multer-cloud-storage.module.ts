import { type DynamicModule, type Type, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { type ModuleDI, type OptionalModuleDI } from 'src/common/types';
import { MulterCloudStorage } from './storage/multer-cloud-storage.abstract';

@Module({})
export class MulterCloudStorageModule {
  static of({
    storage,
    imports,
    providers,
  }: {
    storage: Type<MulterCloudStorage>;
  } & Omit<OptionalModuleDI, 'controllers' | 'exports'>): DynamicModule {
    const multerStorageModuleDI = {
      imports,
      providers: ([storage] as ModuleDI['providers']).concat(providers ?? []),
      exports: [storage] as ModuleDI['exports'],
    };

    const multerStorageModule: DynamicModule = {
      module: MulterCloudStorageModule,
      imports: multerStorageModuleDI.imports,
      providers: multerStorageModuleDI.providers,
      exports: multerStorageModuleDI.exports,
    };

    const multerModule = MulterModule.registerAsync({
      imports: [multerStorageModule],
      useFactory(multerStorage: MulterCloudStorage) {
        return {
          storage: multerStorage,
          fileFilter: multerStorage._fileFilter,
          limits: multerStorage.multerOptions?.limits,
        };
      },
      inject: multerStorageModuleDI.exports,
    });

    return multerModule;
  }
}
