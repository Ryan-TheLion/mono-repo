import { AUTH_HEADER_TOKEN_TYPE } from 'src/common/types';

export const createBearerAuthHeader = (jwt: string) =>
  `${AUTH_HEADER_TOKEN_TYPE.Bearer} ${jwt}`;
