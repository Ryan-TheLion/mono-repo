import { BaseResponseDto } from './base-response.dto';
import { AppEmptyResponse, ValidResponse } from '../types';
import { HttpStatus } from '@nestjs/common';

export class SuccessfulResponseDto<
  Response extends ValidResponse = AppEmptyResponse,
> extends BaseResponseDto<Response> {
  /**
   * http 상태 코드 200
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/200}
   */
  static ok<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static ok<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static ok<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.OK, response as Response);
  }

  /**
   * http 상태 코드 201
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/201}
   */
  static created<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static created<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static created<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.CREATED, response as Response);
  }

  /**
   * http 상태 코드 202
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/202}
   */
  static accepted<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static accepted<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static accepted<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.ACCEPTED, response as Response);
  }

  /**
   * http 상태 코드 203
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/203}
   */
  static nonAuthoritativeInformation<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static nonAuthoritativeInformation<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static nonAuthoritativeInformation<
    Response extends ValidResponse = AppEmptyResponse,
  >(response?: Response) {
    return BaseResponseDto.of(
      HttpStatus.NON_AUTHORITATIVE_INFORMATION,
      response as Response,
    );
  }

  /**
   * http 상태 코드 204
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/204}
   */
  static noContent<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static noContent<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static noContent<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.NO_CONTENT, response as Response);
  }

  /**
   * http 상태 코드 205
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/205}
   */
  static resetContent<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static resetContent<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static resetContent<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.RESET_CONTENT, response as Response);
  }

  /**
   * http 상태 코드 206
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/206}
   */
  static partialContent<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static partialContent<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static partialContent<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.PARTIAL_CONTENT, response as Response);
  }

  /**
   * http 상태 코드 207
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/207}
   */
  static multiStatus<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static multiStatus<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static multiStatus<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.MULTI_STATUS, response as Response);
  }

  /**
   * http 상태 코드 208
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/208}
   */
  static alreadyReported<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static alreadyReported<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static alreadyReported<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.ALREADY_REPORTED,
      response as Response,
    );
  }
}
