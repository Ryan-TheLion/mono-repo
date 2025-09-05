import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { type ValidResponse } from '../types';
import { isRecord } from '../utils';

export type PaginationWith<Payload extends ValidResponse> =
  Payload extends Record<any, any>
    ? Payload & { pagination: Pagination }
    : { payload: Payload; pagination: Pagination };

export const PAGINATION_RANGE = {
  Page: { min: 1 },
  Size: { min: 5, max: 20 },
} as const satisfies Record<
  Capitalize<string>,
  { min: number } | { max: number } | { min: number; max: number }
>;

export class PaginationQuery {
  @IsNumber()
  @Min(PAGINATION_RANGE.Page.min)
  @Type(() => Number)
  page: number;

  @IsOptional()
  @IsNumber()
  @Min(PAGINATION_RANGE.Size.min)
  @Max(PAGINATION_RANGE.Size.max)
  @Type(() => Number)
  size: number = PAGINATION_RANGE.Size.min;
}

export class Pagination {
  page: number;

  size: number;

  total: number;

  pages: number;

  hasPrevPage: boolean;

  prevPage?: number;

  hasNextPage: boolean;

  nextPage?: number;

  static with<Payload extends ValidResponse>(
    payload: Payload,
    pagination: Pick<Pagination, 'total' | 'page' | 'size'>,
  ): PaginationWith<Payload> {
    const pages = Math.ceil(pagination.total / pagination.size);

    const hasPrevPage = pagination.page > 1;
    const hasNextPage = pagination.page < pages;

    const paginationPayload: Pagination = {
      total: pagination.total,
      page: pagination.page,
      size: pagination.size,
      pages,
      hasPrevPage,
      ...(hasPrevPage && { prevPage: pagination.page - 1 }),
      hasNextPage,
      ...(hasNextPage && { nextPage: pagination.page + 1 }),
    };

    if (isRecord(payload)) {
      return {
        ...(payload as Record<any, any>),
        pagination: paginationPayload,
      } as PaginationWith<Payload>;
    }

    return {
      payload,
      pagination: paginationPayload,
    } as PaginationWith<Payload>;
  }
}
