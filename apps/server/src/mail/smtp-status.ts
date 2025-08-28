/**
 * smtp 인증 status
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4954#section-6}
 */
export const SMTP_AUTH_STATUS = {
  SUCCESS: 235,
  PASSWORD_TRANSITION_NEEDED: 432,
  TEMP_AUTH_FAILURE: 454,
  LINE_TOO_LONG: 500,
  AUTH_REQUIRED: 530,
  WEAK_MECHANISM: 534,
  INVALID_CREDENTIALS: 535,
  ENCRYPTION_REQUIRED: 538,
} as const satisfies Record<string, number>;
