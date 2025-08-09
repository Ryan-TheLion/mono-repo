import {
  AUTH_HEADER_TOKEN_TYPE,
  type BasicAuthHeaderCredential,
} from 'src/common/types';

export const createBasicAuthHeader = ({
  user,
  password,
}: BasicAuthHeaderCredential) =>
  `${AUTH_HEADER_TOKEN_TYPE.Basic} ${encodeBasicToken({ user, password })}`;

export const encodeBasicToken = ({
  user,
  password,
}: BasicAuthHeaderCredential) =>
  Buffer.from(`${user}:${password}`, 'utf-8').toString('base64');

export const decodeBasicToken = (token: string) =>
  Buffer.from(token, 'base64').toString('utf-8');
