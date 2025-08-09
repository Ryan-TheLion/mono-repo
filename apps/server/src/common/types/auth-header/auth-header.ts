import * as TokenType from './token-type';

export { type TokenType };

export type AuthHeaderTokenType = TokenType.Basic | TokenType.Bearer;

export type BasicAuthHeaderCredential = {
  user: string;
  password: string;
};

export type BasicAuthHeaderPayload = {
  credential: BasicAuthHeaderCredential;
};

export type BearerAuthHeaderPayload = {
  jwt: string;
};

export type AuthHeaderPayload<Type extends AuthHeaderTokenType> = {
  [AUTH_HEADER_TOKEN_TYPE.Basic]: BasicAuthHeaderPayload;
  [AUTH_HEADER_TOKEN_TYPE.Bearer]: BearerAuthHeaderPayload;
}[Type];

export type AuthHeaderBadRequestReason =
  | 'INVALID_HEADER_FORMAT'
  | 'INVALID_TOKEN_TYPE'
  | 'INVALID_CREDENTIAL'
  | 'INVALID_CREDENTIAL_FORMAT'
  | 'INVALID_JWT'
  | 'INVALID_JWT_FORMAT';

export type BasicAuthHeader = {
  type: TokenType.Basic;
} & BasicAuthHeaderPayload;

export type BearerAuthHeader = {
  type: TokenType.Bearer;
} & BearerAuthHeaderPayload;

export type BadRequestAuthHeader = {
  type: null;
  badRequest: AuthHeaderBadRequestReason;
};

export type EmptyAuthHeader = {
  type: null;
  badRequest: null;
};

export type ParsedAuthHeader =
  | BasicAuthHeader
  | BearerAuthHeader
  | BadRequestAuthHeader
  | EmptyAuthHeader;

type AuthHeaderTokenTypeConstants = {
  readonly [K in AuthHeaderTokenType]: K;
};

export const AUTH_HEADER_TOKEN_TYPE = {
  Basic: 'Basic',
  Bearer: 'Bearer',
} satisfies AuthHeaderTokenTypeConstants as AuthHeaderTokenTypeConstants;

// 타입 가드 함수

export const isBasicAuthHeader = (
  parsedHeader: ParsedAuthHeader,
): parsedHeader is BasicAuthHeader => {
  return parsedHeader.type === 'Basic';
};

export const isBearerAuthHeader = (
  parsedHeader: ParsedAuthHeader,
): parsedHeader is BearerAuthHeader => {
  return parsedHeader.type === 'Bearer';
};

export const isBadRequestAuthHeader = (
  parsedHeader: ParsedAuthHeader,
): parsedHeader is BadRequestAuthHeader => {
  return parsedHeader.type === null && parsedHeader.badRequest !== null;
};

export const isEmptyAuthHeader = (
  parsedHeader: ParsedAuthHeader,
): parsedHeader is EmptyAuthHeader => {
  return parsedHeader.type === null && parsedHeader.badRequest === null;
};
