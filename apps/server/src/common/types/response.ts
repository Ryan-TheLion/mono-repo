import { HttpStatus, StreamableFile } from '@nestjs/common';
import {
  type EmptyObject,
  type EmptyString,
  type PrimitiveType,
} from './primitive';
import { BaseResponseDto } from '../dto/base-response.dto';

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

export interface BaseResponseDtoBuilder {
  <Response extends AppEmptyResponse>(
    status: HttpStatus,
    response?: Response,
  ): BaseResponseDto<Response>;
  <Response extends ValidResponse>(
    status: HttpStatus,
    response: Response,
  ): BaseResponseDto<Response>;
}

export interface DataResponseDtoBuilder {
  <Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  <Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
}
