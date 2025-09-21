import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ContentTypeGuard } from '../guard';

export const CONTENT_TYPE_METADATA_KEY =
  'contentType' as const satisfies string;

/**
 * 요청 헤더의 Content-Type이 설정한 contentType 문자열로 시작하지 않을 경우 에러 (가드)
 */
export const RequireContentType = (contentType: string) => {
  return applyDecorators(
    SetMetadata(CONTENT_TYPE_METADATA_KEY, contentType),
    UseGuards(ContentTypeGuard),
  );
};
