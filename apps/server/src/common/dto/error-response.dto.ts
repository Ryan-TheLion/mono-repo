import { HttpStatus } from '@nestjs/common';
import { AppEmptyResponse, ValidResponse } from '../types';
import { BaseResponseDto } from './base-response.dto';

type ErrorStatus =
  | HttpStatus.BAD_REQUEST
  | HttpStatus.UNAUTHORIZED
  | HttpStatus.PAYMENT_REQUIRED
  | HttpStatus.FORBIDDEN
  | HttpStatus.NOT_FOUND
  | HttpStatus.METHOD_NOT_ALLOWED
  | HttpStatus.NOT_ACCEPTABLE
  | HttpStatus.PROXY_AUTHENTICATION_REQUIRED
  | HttpStatus.REQUEST_TIMEOUT
  | HttpStatus.CONFLICT
  | HttpStatus.GONE
  | HttpStatus.LENGTH_REQUIRED
  | HttpStatus.PRECONDITION_FAILED
  | HttpStatus.PAYLOAD_TOO_LARGE
  | HttpStatus.URI_TOO_LONG
  | HttpStatus.UNSUPPORTED_MEDIA_TYPE
  | HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE
  | HttpStatus.EXPECTATION_FAILED
  | HttpStatus.I_AM_A_TEAPOT
  | HttpStatus.MISDIRECTED
  | HttpStatus.UNPROCESSABLE_ENTITY
  | HttpStatus.LOCKED
  | HttpStatus.FAILED_DEPENDENCY
  | HttpStatus.PRECONDITION_REQUIRED
  | HttpStatus.TOO_MANY_REQUESTS
  | HttpStatus.INTERNAL_SERVER_ERROR
  | HttpStatus.NOT_IMPLEMENTED
  | HttpStatus.BAD_GATEWAY
  | HttpStatus.SERVICE_UNAVAILABLE
  | HttpStatus.GATEWAY_TIMEOUT
  | HttpStatus.HTTP_VERSION_NOT_SUPPORTED
  | HttpStatus.INSUFFICIENT_STORAGE
  | HttpStatus.LOOP_DETECTED;

export class ErrorResponseDto<
  Response extends ValidResponse = AppEmptyResponse,
> extends BaseResponseDto<Response> {
  private static errorDtoMap = {
    [HttpStatus.BAD_REQUEST]: this.badRequest.bind(
      this,
    ) as (typeof ErrorResponseDto)['badRequest'],
    [HttpStatus.UNAUTHORIZED]: this.unauthorized.bind(
      this,
    ) as (typeof ErrorResponseDto)['unauthorized'],
    [HttpStatus.PAYMENT_REQUIRED]: this.paymentRequired.bind(
      this,
    ) as (typeof ErrorResponseDto)['paymentRequired'],
    [HttpStatus.FORBIDDEN]: this.forbidden.bind(
      this,
    ) as (typeof ErrorResponseDto)['forbidden'],
    [HttpStatus.NOT_FOUND]: this.notFound.bind(
      this,
    ) as (typeof ErrorResponseDto)['notFound'],
    [HttpStatus.METHOD_NOT_ALLOWED]: this.methodNotAllowed.bind(
      this,
    ) as (typeof ErrorResponseDto)['methodNotAllowed'],
    [HttpStatus.NOT_ACCEPTABLE]: this.notAcceptable.bind(
      this,
    ) as (typeof ErrorResponseDto)['notAcceptable'],
    [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]:
      this.proxyAuthenticationRequired.bind(
        this,
      ) as (typeof ErrorResponseDto)['proxyAuthenticationRequired'],
    [HttpStatus.REQUEST_TIMEOUT]: this.requestTimeout.bind(
      this,
    ) as (typeof ErrorResponseDto)['requestTimeout'],
    [HttpStatus.CONFLICT]: this.conflict.bind(
      this,
    ) as (typeof ErrorResponseDto)['conflict'],
    [HttpStatus.GONE]: this.gone.bind(
      this,
    ) as (typeof ErrorResponseDto)['gone'],
    [HttpStatus.LENGTH_REQUIRED]: this.lengthRequired.bind(
      this,
    ) as (typeof ErrorResponseDto)['lengthRequired'],
    [HttpStatus.PRECONDITION_FAILED]: this.preconditionFailed.bind(
      this,
    ) as (typeof ErrorResponseDto)['preconditionFailed'],
    [HttpStatus.PAYLOAD_TOO_LARGE]: this.payloadTooLarge.bind(
      this,
    ) as (typeof ErrorResponseDto)['payloadTooLarge'],
    [HttpStatus.URI_TOO_LONG]: this.uriTooLong.bind(
      this,
    ) as (typeof ErrorResponseDto)['uriTooLong'],
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: this.unsupportedMediaType.bind(
      this,
    ) as (typeof ErrorResponseDto)['unsupportedMediaType'],
    [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]:
      this.requestedRangeNotSatisfiable.bind(
        this,
      ) as (typeof ErrorResponseDto)['requestedRangeNotSatisfiable'],
    [HttpStatus.EXPECTATION_FAILED]: this.expectationFailed.bind(
      this,
    ) as (typeof ErrorResponseDto)['expectationFailed'],
    [HttpStatus.I_AM_A_TEAPOT]: this.iAmTeapot.bind(
      this,
    ) as (typeof ErrorResponseDto)['iAmTeapot'],
    [HttpStatus.MISDIRECTED]: this.misdirected.bind(
      this,
    ) as (typeof ErrorResponseDto)['misdirected'],
    [HttpStatus.UNPROCESSABLE_ENTITY]: this.unprocessableEntity.bind(
      this,
    ) as (typeof ErrorResponseDto)['unprocessableEntity'],
    [HttpStatus.LOCKED]: this.locked.bind(
      this,
    ) as (typeof ErrorResponseDto)['locked'],
    [HttpStatus.FAILED_DEPENDENCY]: this.failedDependency.bind(
      this,
    ) as (typeof ErrorResponseDto)['failedDependency'],
    [HttpStatus.PRECONDITION_REQUIRED]: this.preconditionRequired.bind(
      this,
    ) as (typeof ErrorResponseDto)['preconditionRequired'],
    [HttpStatus.TOO_MANY_REQUESTS]: this.tooManyRequests.bind(
      this,
    ) as (typeof ErrorResponseDto)['tooManyRequests'],
    [HttpStatus.INTERNAL_SERVER_ERROR]: this.internalServerError.bind(
      this,
    ) as (typeof ErrorResponseDto)['internalServerError'],
    [HttpStatus.NOT_IMPLEMENTED]: this.notImplemented.bind(
      this,
    ) as (typeof ErrorResponseDto)['notImplemented'],
    [HttpStatus.BAD_GATEWAY]: this.badGateway.bind(
      this,
    ) as (typeof ErrorResponseDto)['badGateway'],
    [HttpStatus.SERVICE_UNAVAILABLE]: this.serviceUnavailable.bind(
      this,
    ) as (typeof ErrorResponseDto)['serviceUnavailable'],
    [HttpStatus.GATEWAY_TIMEOUT]: this.gatewayTimeout.bind(
      this,
    ) as (typeof ErrorResponseDto)['gatewayTimeout'],
    [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: this.httpVersionNotSupported.bind(
      this,
    ) as (typeof ErrorResponseDto)['httpVersionNotSupported'],
    [HttpStatus.INSUFFICIENT_STORAGE]: this.insufficientStorage.bind(
      this,
    ) as (typeof ErrorResponseDto)['insufficientStorage'],
    [HttpStatus.LOOP_DETECTED]: this.loopDetected.bind(
      this,
    ) as (typeof ErrorResponseDto)['loopDetected'],
  };

  static filterStatus<Status extends ErrorStatus>(status: Status) {
    return this.errorDtoMap[status].bind(
      this,
    ) as (typeof this.errorDtoMap)[Status];
  }

  /**
   * http 상태 코드 400
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/400}
   */
  static badRequest<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static badRequest<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static badRequest<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.BAD_REQUEST, response as Response);
  }

  /**
   * http 상태 코드 401
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/401}
   */
  static unauthorized<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static unauthorized<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static unauthorized<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.UNAUTHORIZED, response as Response);
  }

  /**
   * http 상태 코드 402
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/402}
   */
  static paymentRequired<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static paymentRequired<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static paymentRequired<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.PAYMENT_REQUIRED,
      response as Response,
    );
  }

  /**
   * http 상태 코드 403
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/403}
   */
  static forbidden<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static forbidden<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static forbidden<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.FORBIDDEN, response as Response);
  }

  /**
   * http 상태 코드 404
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/404}
   */
  static notFound<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static notFound<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static notFound<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.NOT_FOUND, response as Response);
  }

  /**
   * http 상태 코드 405
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/405}
   */
  static methodNotAllowed<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static methodNotAllowed<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static methodNotAllowed<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.METHOD_NOT_ALLOWED,
      response as Response,
    );
  }

  /**
   * http 상태 코드 406
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/406}
   */
  static notAcceptable<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static notAcceptable<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static notAcceptable<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.NOT_ACCEPTABLE, response as Response);
  }

  /**
   * http 상태 코드 407
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/407}
   */
  static proxyAuthenticationRequired<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static proxyAuthenticationRequired<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static proxyAuthenticationRequired<
    Response extends ValidResponse = AppEmptyResponse,
  >(response?: Response) {
    return BaseResponseDto.of(
      HttpStatus.PROXY_AUTHENTICATION_REQUIRED,
      response as Response,
    );
  }

  /**
   * http 상태 코드 408
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/408}
   */
  static requestTimeout<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static requestTimeout<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static requestTimeout<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.REQUEST_TIMEOUT, response as Response);
  }

  /**
   * http 상태 코드 409
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/409}
   */
  static conflict<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static conflict<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static conflict<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.CONFLICT, response as Response);
  }

  /**
   * http 상태 코드 410
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/410}
   */
  static gone<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static gone<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static gone<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.GONE, response as Response);
  }

  /**
   * http 상태 코드 411
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/411}
   */
  static lengthRequired<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static lengthRequired<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static lengthRequired<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.LENGTH_REQUIRED, response as Response);
  }

  /**
   * http 상태 코드 412
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/412}
   */
  static preconditionFailed<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static preconditionFailed<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static preconditionFailed<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.PRECONDITION_FAILED,
      response as Response,
    );
  }

  /**
   * http 상태 코드 413
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/413}
   */
  static payloadTooLarge<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static payloadTooLarge<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static payloadTooLarge<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.PAYLOAD_TOO_LARGE,
      response as Response,
    );
  }

  /**
   * http 상태 코드 414
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/414}
   */
  static uriTooLong<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static uriTooLong<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static uriTooLong<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.URI_TOO_LONG, response as Response);
  }

  /**
   * http 상태 코드 415
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/415}
   */
  static unsupportedMediaType<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static unsupportedMediaType<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static unsupportedMediaType<
    Response extends ValidResponse = AppEmptyResponse,
  >(response?: Response) {
    return BaseResponseDto.of(
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      response as Response,
    );
  }

  /**
   * http 상태 코드 416
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/416}
   */
  static requestedRangeNotSatisfiable<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static requestedRangeNotSatisfiable<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static requestedRangeNotSatisfiable<
    Response extends ValidResponse = AppEmptyResponse,
  >(response?: Response) {
    return BaseResponseDto.of(
      HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
      response as Response,
    );
  }

  /**
   * http 상태 코드 417
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/417}
   */
  static expectationFailed<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static expectationFailed<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static expectationFailed<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.EXPECTATION_FAILED,
      response as Response,
    );
  }

  /**
   * http 상태 코드 418
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/418}
   */
  static iAmTeapot<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static iAmTeapot<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static iAmTeapot<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.I_AM_A_TEAPOT, response as Response);
  }

  /**
   * http 상태 코드 421
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/421}
   */
  static misdirected<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static misdirected<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static misdirected<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.MISDIRECTED, response as Response);
  }

  /**
   * http 상태 코드 422
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/422}
   */
  static unprocessableEntity<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static unprocessableEntity<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static unprocessableEntity<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.UNPROCESSABLE_ENTITY,
      response as Response,
    );
  }

  /**
   * http 상태 코드 423
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/423}
   */
  static locked<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static locked<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static locked<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.LOCKED, response as Response);
  }

  /**
   * http 상태 코드 424
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/424}
   */
  static failedDependency<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static failedDependency<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static failedDependency<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.FAILED_DEPENDENCY,
      response as Response,
    );
  }

  /**
   * http 상태 코드 428
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/428}
   */
  static preconditionRequired<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static preconditionRequired<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static preconditionRequired<
    Response extends ValidResponse = AppEmptyResponse,
  >(response?: Response) {
    return BaseResponseDto.of(
      HttpStatus.PRECONDITION_REQUIRED,
      response as Response,
    );
  }

  /**
   * http 상태 코드 429
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/429}
   */
  static tooManyRequests<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static tooManyRequests<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static tooManyRequests<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.TOO_MANY_REQUESTS,
      response as Response,
    );
  }

  /**
   * http 상태 코드 500
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/500}
   */
  static internalServerError<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static internalServerError<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static internalServerError<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.INTERNAL_SERVER_ERROR,
      response as Response,
    );
  }

  /**
   * http 상태 코드 501
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/501}
   */
  static notImplemented<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static notImplemented<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static notImplemented<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.NOT_IMPLEMENTED, response as Response);
  }

  /**
   * http 상태 코드 502
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/502}
   */
  static badGateway<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static badGateway<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static badGateway<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.BAD_GATEWAY, response as Response);
  }

  /**
   * http 상태 코드 503
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/503}
   */
  static serviceUnavailable<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static serviceUnavailable<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static serviceUnavailable<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.SERVICE_UNAVAILABLE,
      response as Response,
    );
  }

  /**
   * http 상태 코드 504
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/504}
   */
  static gatewayTimeout<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static gatewayTimeout<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static gatewayTimeout<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.GATEWAY_TIMEOUT, response as Response);
  }

  /**
   * http 상태 코드 505
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/505}
   */
  static httpVersionNotSupported<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static httpVersionNotSupported<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static httpVersionNotSupported<
    Response extends ValidResponse = AppEmptyResponse,
  >(response?: Response) {
    return BaseResponseDto.of(
      HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
      response as Response,
    );
  }

  /**
   * http 상태 코드 507
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/507}
   */
  static insufficientStorage<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static insufficientStorage<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static insufficientStorage<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(
      HttpStatus.INSUFFICIENT_STORAGE,
      response as Response,
    );
  }

  /**
   * http 상태 코드 508
   *
   * @see {@link https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/508}
   */
  static loopDetected<Response extends AppEmptyResponse>(
    response?: Response,
  ): BaseResponseDto<Response>;
  static loopDetected<Response extends ValidResponse>(
    response: Response,
  ): BaseResponseDto<Response>;
  static loopDetected<Response extends ValidResponse = AppEmptyResponse>(
    response?: Response,
  ) {
    return BaseResponseDto.of(HttpStatus.LOOP_DETECTED, response as Response);
  }
}

// const errorDtoMap = {
//   [HttpStatus.BAD_REQUEST]: ErrorResponseDto.badRequest,
//   [HttpStatus.UNAUTHORIZED]: ErrorResponseDto.unauthorized,
//   [HttpStatus.PAYMENT_REQUIRED]: ErrorResponseDto.paymentRequired,
//   [HttpStatus.FORBIDDEN]: ErrorResponseDto.forbidden,
//   [HttpStatus.NOT_FOUND]: ErrorResponseDto.notFound,
//   [HttpStatus.METHOD_NOT_ALLOWED]: ErrorResponseDto.methodNotAllowed,
//   [HttpStatus.NOT_ACCEPTABLE]: ErrorResponseDto.notAcceptable,
//   [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]:
//     ErrorResponseDto.proxyAuthenticationRequired,
//   [HttpStatus.REQUEST_TIMEOUT]: ErrorResponseDto.requestTimeout,
//   [HttpStatus.CONFLICT]: ErrorResponseDto.conflict,
//   [HttpStatus.GONE]: ErrorResponseDto.gone,
//   [HttpStatus.LENGTH_REQUIRED]: ErrorResponseDto.lengthRequired,
//   [HttpStatus.PRECONDITION_FAILED]: ErrorResponseDto.preconditionFailed,
//   [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorResponseDto.payloadTooLarge,
//   [HttpStatus.URI_TOO_LONG]: ErrorResponseDto.uriTooLong,
//   [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: ErrorResponseDto.unsupportedMediaType,
//   [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]:
//     ErrorResponseDto.requestedRangeNotSatisfiable,
//   [HttpStatus.EXPECTATION_FAILED]: ErrorResponseDto.expectationFailed,
//   [HttpStatus.I_AM_A_TEAPOT]: ErrorResponseDto.iAmTeapot,
//   [HttpStatus.MISDIRECTED]: ErrorResponseDto.misdirected,
//   [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorResponseDto.unprocessableEntity,
//   [HttpStatus.LOCKED]: ErrorResponseDto.locked,
//   [HttpStatus.FAILED_DEPENDENCY]: ErrorResponseDto.failedDependency,
//   [HttpStatus.PRECONDITION_REQUIRED]: ErrorResponseDto.preconditionRequired,
//   [HttpStatus.TOO_MANY_REQUESTS]: ErrorResponseDto.tooManyRequests,
//   [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorResponseDto.internalServerError,
//   [HttpStatus.NOT_IMPLEMENTED]: ErrorResponseDto.notImplemented,
//   [HttpStatus.BAD_GATEWAY]: ErrorResponseDto.badGateway,
//   [HttpStatus.SERVICE_UNAVAILABLE]: ErrorResponseDto.serviceUnavailable,
//   [HttpStatus.GATEWAY_TIMEOUT]: ErrorResponseDto.gatewayTimeout,
//   [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]:
//     ErrorResponseDto.httpVersionNotSupported,
//   [HttpStatus.INSUFFICIENT_STORAGE]: ErrorResponseDto.insufficientStorage,
//   [HttpStatus.LOOP_DETECTED]: ErrorResponseDto.loopDetected,
// };
