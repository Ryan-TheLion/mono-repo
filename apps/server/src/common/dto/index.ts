import { type ValidResponse, type AppEmptyResponse } from '../types';
import { BaseResponseDto } from './base-response.dto';
import { InformationalResponseDto } from './informational-response.dto';
import { SuccessfulResponseDto } from './successful-response.dto';
import { RedirectionResponseDto } from './redirection-response.dto';
import { ErrorResponseDto } from './error-response.dto';

export class AppResponseDto<
  Response extends ValidResponse = AppEmptyResponse,
> extends BaseResponseDto<Response> {
  /** status 1xx */
  static Informational = InformationalResponseDto;
  /** status 2xx */
  static Successful = SuccessfulResponseDto;
  /** status 3xx */
  static Redirection = RedirectionResponseDto;
  /** status 4xx, 5xx */
  static Error = ErrorResponseDto;
}
