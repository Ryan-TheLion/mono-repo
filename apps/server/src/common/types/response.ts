import { StreamableFile } from '@nestjs/common';
import { EmptyObject, EmptyString, PrimitiveType } from './primitive';

export type EmptyResponse = EmptyString | EmptyObject | null;

export type ValidResponse =
  | Exclude<EmptyResponse, EmptyString | null>
  | Exclude<PrimitiveType, bigint | symbol | undefined>
  | Record<any, any>
  | Array<any>
  | Buffer
  | ReadableStream
  | StreamableFile;

export type AppEmptyResponse = Extract<EmptyResponse, null>;
