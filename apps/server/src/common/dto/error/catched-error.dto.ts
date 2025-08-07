export class CatchedErrorResponseDto {
  name: string;

  message: string;

  path: string;

  timestamp: string;

  protected constructor(dto: {
    name: string;
    message: string;
    path: string;
    timestamp: string;
  }) {
    this.name = dto.name;
    this.message = dto.message;
    this.path = dto.path;
    this.timestamp = dto.timestamp;
  }

  protected static of(dto: {
    name: string;
    message: string;
    path: string;
    timestamp: string;
  }) {
    return new CatchedErrorResponseDto(dto);
  }
}
