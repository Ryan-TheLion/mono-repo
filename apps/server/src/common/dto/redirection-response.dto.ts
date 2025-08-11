import { HttpStatus } from '@nestjs/common';
import { type AppEmptyResponse, type ValidResponse } from '../types';
import { BaseResponseDto } from './base-response.dto';

export class RedirectionResponseDto<
  Response extends ValidResponse = AppEmptyResponse,
> extends BaseResponseDto<Response> {
  /**
   * http 상태 코드 300
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/300}
   */
  static multipleChoice<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static multipleChoice<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static multipleChoice<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.AMBIGUOUS, response as Response);
  }

  /**
   * http 상태 코드 301
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/301}
   */
  static movedPermanently<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static movedPermanently<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static movedPermanently<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.MOVED_PERMANENTLY,
      response as Response,
    );
  }

  /**
   * http 상태 코드 302
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/302}
   */
  static found<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static found<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static found<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.FOUND, response as Response);
  }

  /**
   * http 상태 코드 303
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/303}
   */
  static seeOther<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static seeOther<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static seeOther<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.SEE_OTHER, response as Response);
  }

  /**
   * http 상태 코드 304
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/304}
   */
  static notModified<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static notModified<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static notModified<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.NOT_MODIFIED, response as Response);
  }

  /**
   * http 상태 코드 307
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/307}
   */
  static temporaryRedirect<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static temporaryRedirect<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static temporaryRedirect<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.TEMPORARY_REDIRECT,
      response as Response,
    );
  }

  /**
   * http 상태 코드 308
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/308}
   */
  static permanentRedirect<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static permanentRedirect<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static permanentRedirect<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.PERMANENT_REDIRECT,
      response as Response,
    );
  }
}
