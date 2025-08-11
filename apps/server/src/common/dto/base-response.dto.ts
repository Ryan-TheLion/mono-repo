import { HttpStatus } from '@nestjs/common';
import { type AppEmptyResponse, type ValidResponse } from '../types';

export class BaseResponseDto<
  Response extends ValidResponse = AppEmptyResponse,
> {
  status: HttpStatus;

  response: Response;

  protected constructor(
    status: HttpStatus,
    response = null satisfies AppEmptyResponse as Response,
  ) {
    this.status = status;
    this.response = response;
  }

  protected static of<Response extends AppEmptyResponse>(
    status: HttpStatus,
    response?: Response,
  ): BaseResponseDto<Response>;
  protected static of<Response extends ValidResponse>(
    status: HttpStatus,
    response: Response,
  ): BaseResponseDto<Response>;
  protected static of<Response extends ValidResponse = AppEmptyResponse>(
    status: HttpStatus,
    response?: Response,
  ) {
    return new BaseResponseDto<Response>(status, response as Response);
  }
}
