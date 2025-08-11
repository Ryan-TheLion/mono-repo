export class CatchedErrorResponseDto {
  name: string;

  message: string;

  path: string;

  timestamp: number;

  static of(dto: {
    name: string;
    message: string;
    path: string;
    timestamp: number;
  }) {
    const responseDto = new CatchedErrorResponseDto();

    responseDto.name = dto.name;
    responseDto.message = dto.message;
    responseDto.path = dto.path;
    responseDto.timestamp = dto.timestamp;

    return responseDto;
  }
}
