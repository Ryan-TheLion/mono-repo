import { Pagination, PaginationQuery } from '../dto';
import { createBuilder } from './builder';
import * as z from 'zod';

type PaginationRange = z.infer<typeof paginationRangeSchema>;

type CountMethodParam = {
  total: number;
  query: Pick<PaginationQuery, 'page' | 'size'>;
};

interface Count {
  (
    param: CountMethodParam & Partial<Record<keyof PaginationRange, never>>,
  ): number;
  (
    param: PaginationRange & Partial<Record<keyof CountMethodParam, never>>,
  ): number;
}

const paginationRangeSchema = z.object({
  overflow: z.boolean(),
  empty: z.boolean(),
  from: z.number(),
  to: z.number(),
});

const isPaginationRange = (value: unknown): value is PaginationRange => {
  return z.safeParse(paginationRangeSchema, value).success;
};

const RANGE_NOT_MATCHING = 0 as const satisfies number;

export const paginationBuilder = () => createBuilder<Pagination>();

export class PaginationUtils {
  static pages = ({
    total,
    size,
  }: Pick<Pagination, 'total'> & Pick<PaginationQuery, 'size'>) => {
    return Math.ceil(total / size);
  };

  static range = ({
    total,
    query,
  }: {
    total: number;
    query: Pick<PaginationQuery, 'page' | 'size'>;
  }): PaginationRange => {
    const { page, size } = query;

    const pages = this.pages({ total, size });

    const overflow = !pages ? false : page > pages;
    const empty = !total;

    if (empty || overflow) {
      return {
        overflow,
        empty,
        from: RANGE_NOT_MATCHING,
        to: RANGE_NOT_MATCHING,
      };
    }

    return {
      overflow: false,
      empty: false,
      from: (page - 1) * size + 1,
      to: page === pages ? total : page * size,
    };
  };

  static count: Count = (param: CountMethodParam | PaginationRange): number => {
    const range = isPaginationRange(param)
      ? param
      : this.range({
          total: param.total,
          query: param.query,
        });

    if (range.empty || range.overflow) return 0;

    return range.to - range.from + 1;
  };

  static slicePage<Payload>(
    payload: Payload[],
    query: Pick<PaginationQuery, 'size'>,
  ): {
    at: (page: number) => Payload[];
  } {
    const total = payload.length;
    const { size } = query;

    const slice = (targetPage: number) => {
      const range = this.range({
        total,
        query: { page: targetPage, size },
      });

      if (range.empty || range.overflow) return [];

      return payload.slice(range.from - 1, range.to);
    };

    return {
      at(targetPage) {
        return slice(targetPage);
      },
    };
  }

  static createPagination = ({
    total,
    query,
  }: {
    total: number;
    query: Pick<PaginationQuery, 'page' | 'size'>;
  }): Pagination => {
    const { page, size } = query;

    const pages = PaginationUtils.pages({
      total,
      size,
    });

    const range = PaginationUtils.range({
      total,
      query: { page, size },
    });

    const count = PaginationUtils.count(range);

    return {
      page,
      perSize: size,
      count,
      total,
      pages,
      overflow: range.overflow,
      prevPage: range.overflow || range.empty || page === 1 ? null : page - 1,
      nextPage:
        range.overflow || range.empty || page === pages ? null : page + 1,
    };
  };
}
