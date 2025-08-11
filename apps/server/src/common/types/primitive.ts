export type PrimitiveType =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint;

export type EmptyObject = Record<any, never>;

export type EmptyString = '';
