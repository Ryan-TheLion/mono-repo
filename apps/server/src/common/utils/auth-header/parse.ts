import { isJWT } from 'class-validator';
import {
  type AuthHeaderTokenType,
  type BasicAuthHeader,
  type BasicAuthHeaderCredential,
  type BasicAuthHeaderPayload,
  type BearerAuthHeader,
  type BearerAuthHeaderPayload,
  type BadRequestAuthHeader,
  type AuthHeaderBadRequestReason,
  type EmptyAuthHeader,
  type AuthHeaderPayload,
  type ParsedAuthHeader,
  AUTH_HEADER_TOKEN_TYPE,
} from '../../types';
import { decodeBasicToken } from './basic';

const validTokenTypes = [
  AUTH_HEADER_TOKEN_TYPE.Basic,
  AUTH_HEADER_TOKEN_TYPE.Bearer,
] as const;

const VALID_SEGMENTS_LENGTH = 2;

const createEmptyAuthHeader = () => {
  return {
    type: null,
    badRequest: null,
  } satisfies EmptyAuthHeader as ParsedAuthHeader;
};

const createBadRequestAuthHeader = (reason: AuthHeaderBadRequestReason) => {
  return {
    type: null,
    badRequest: reason,
  } satisfies BadRequestAuthHeader as ParsedAuthHeader;
};

const createAuthHeader = <Type extends AuthHeaderTokenType>(
  type: Type,
  payload: AuthHeaderPayload<Type>,
): ParsedAuthHeader => {
  if (type === 'Basic') {
    return {
      type,
      ...(payload as BasicAuthHeaderPayload),
    } satisfies BasicAuthHeader as ParsedAuthHeader;
  }

  return {
    type,
    ...(payload as BearerAuthHeaderPayload),
  } satisfies BearerAuthHeader as ParsedAuthHeader;
};

export const parseAuthHeader = async (
  authHeader: string | undefined,
  {
    validateCredential,
    validateJwt,
  }: {
    validateCredential?: (
      credential: BasicAuthHeaderCredential,
    ) => boolean | Promise<boolean>;
    validateJwt?: (token: string) => boolean | Promise<boolean>;
  } = {},
): Promise<ParsedAuthHeader> => {
  if (authHeader === undefined) return createEmptyAuthHeader();

  if (!authHeader.trim())
    return createBadRequestAuthHeader('INVALID_HEADER_FORMAT');

  const authHeaderSegments = authHeader.split(' ');

  if (authHeaderSegments.length !== VALID_SEGMENTS_LENGTH) {
    return createBadRequestAuthHeader('INVALID_HEADER_FORMAT');
  }

  const [tokenType, token] = authHeaderSegments as [
    AuthHeaderTokenType,
    string,
  ];

  if (!tokenType || !token)
    return createBadRequestAuthHeader('INVALID_HEADER_FORMAT');

  if (!validTokenTypes.includes(tokenType))
    return createBadRequestAuthHeader('INVALID_TOKEN_TYPE');

  switch (tokenType) {
    case 'Basic': {
      const rawCredential = decodeBasicToken(token);

      const credentialSegments = rawCredential.split(':');

      if (credentialSegments.length !== VALID_SEGMENTS_LENGTH)
        return createBadRequestAuthHeader('INVALID_CREDENTIAL_FORMAT');

      const [user, password] = credentialSegments;

      if (!user.trim() || !password.trim())
        return createBadRequestAuthHeader('INVALID_CREDENTIAL_FORMAT');

      if (validateCredential && !(await validateCredential({ user, password })))
        return createBadRequestAuthHeader('INVALID_CREDENTIAL');

      return createAuthHeader('Basic', {
        credential: {
          user,
          password,
        },
      });
    }
    case 'Bearer': {
      if (!token || !isJWT(token))
        return createBadRequestAuthHeader('INVALID_JWT_FORMAT');

      if (validateJwt && !(await validateJwt(token)))
        return createBadRequestAuthHeader('INVALID_JWT');

      return createAuthHeader('Bearer', { jwt: token });
    }
  }
};
