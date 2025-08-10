import { HttpStatus } from '@nestjs/common';
import { type AppEmptyResponse, type ValidResponse } from '../types';
import { BaseResponseDto } from './base-response.dto';

export class InformationalResponseDto<
  Response extends ValidResponse = AppEmptyResponse,
> extends BaseResponseDto<Response> {
  /**
   * http 상태 코드 100
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/100}
   */
  static continue<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static continue<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static continue<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.CONTINUE, response as Response);
  }

  /**
   * http 상태 코드 101
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/101}
   */
  static switchingProtocols<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static switchingProtocols<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static switchingProtocols<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.SWITCHING_PROTOCOLS,
      response as Response,
    );
  }

  /**
   * http 상태 코드 102
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/102}
   */
  static processing<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static processing<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static processing<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.PROCESSING, response as Response);
  }

  /**
   * http 상태 코드 103
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/103}
   */
  static earlyHints<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static earlyHints<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static earlyHints<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.EARLYHINTS, response as Response);
  }
}
