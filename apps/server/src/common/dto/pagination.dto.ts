import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { type ValidResponse } from '../types';
import { isRecord, PaginationUtils } from '../utils';

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
  /**
   * 페이지 번호 (1-based page)
   */
  @IsNumber()
  @Min(PAGINATION_RANGE.Page.min)
  @Type(() => Number)
  page: number;

  /**
   * 페이지에 포함될 항목의 최대 개수
   *
   * `min`: 5
   * `max`: 20
   */
  @IsOptional()
  @IsNumber()
  @Min(PAGINATION_RANGE.Size.min)
  @Max(PAGINATION_RANGE.Size.max)
  @Type(() => Number)
  size: number = PAGINATION_RANGE.Size.min;
}

export class Pagination {
  page: number;

  perSize: number;

  count: number;

  total: number;

  pages: number;

  overflow: boolean;

  prevPage: number | null;

  nextPage: number | null;

  static of<Payload extends ValidResponse>(payload: Payload) {
    const paginate: (
      params: Pick<Pagination, 'total'> & { query: PaginationQuery },
    ) => PaginationWith<Payload> = ({ total, query }) => {
      const pagination = PaginationUtils.createPagination({ total, query });

      if (isRecord(payload)) {
        return {
          ...(payload as Record<any, any>),
          pagination,
        } as PaginationWith<Payload>;
      }

      return {
        payload,
        pagination,
      } as PaginationWith<Payload>;
    };

    return {
      paginate,
    };
  }
}
