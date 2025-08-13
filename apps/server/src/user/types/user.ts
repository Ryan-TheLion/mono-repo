import { UserRoleType } from '.';

export type UserRole = UserRoleType.Admin | UserRoleType.User;

type UserRoleConstants = {
  readonly [K in UserRole]: K;
};

export const USER_ROLE = {
  admin: 'admin',
  user: 'user',
} satisfies UserRoleConstants as UserRoleConstants;
