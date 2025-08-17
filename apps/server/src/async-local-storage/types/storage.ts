import {
  type AuthHeaderPayload,
  type AuthHeaderTokenType,
  type BasicAuthHeader,
  type BearerAuthHeader,
} from 'src/common/types';

type RequestMetaAuthHeader = { rawFormat: string } & (
  | { type?: undefined }
  | BasicAuthHeader
  | BearerAuthHeader
);

export type RequestMetaStore = {
  authHeader: RequestMetaAuthHeader;
  path: string;
  timestamp: number;
};

type PayloadAs<
  Type extends AuthHeaderTokenType | 'unknown' | undefined = undefined,
> = Type extends AuthHeaderTokenType
  ? AuthHeaderPayload<Type>
  : Type extends 'unknown'
    ? unknown
    : AuthHeaderPayload<'Basic'> | AuthHeaderPayload<'Bearer'> | null;

export const reqMetaAuthHeaderPayloadAs = <
  Type extends AuthHeaderTokenType | 'unknown' | undefined = undefined,
>(
  requestMetaAuthHeader: RequestMetaAuthHeader,
): PayloadAs<Type> => {
  const headerPayload = ((
    authHeader: RequestMetaAuthHeader,
  ): AuthHeaderPayload<'Basic'> | AuthHeaderPayload<'Bearer'> | null => {
    if (authHeader?.type == null) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...payload } = authHeader;

    return { ...payload };
  })(requestMetaAuthHeader);

  return headerPayload as PayloadAs<Type>;
};
