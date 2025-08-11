import { type BasicAuthHeader, type BearerAuthHeader } from 'src/common/types';

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
