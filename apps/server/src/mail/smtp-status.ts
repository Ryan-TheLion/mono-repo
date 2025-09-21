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

/**
 * smtp 응답 status
 *
 * - `2yz` Positive Completion Reply
 * - `3yz` Positive Intermediate Reply
 * - `4yz` Transient Negative Completion Reply
 * - `5yz` Permanent Negative Completion Reply
 *
 * - `x0z` Syntax
 * - `x1z` Information
 * - `x2z` Connections
 * - `x3z` Unspecified
 * - `x4z` Unspecified
 * - `x5z` Mail system
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc5321#section-4.2.3}
 */
export const SMTP_REPLY_STATUS = {
  /**
   * System status, or system help reply
   */
  SYSTEM_STATUS: 211,
  /**
   * Help message (Information on how to use the receiver or the
   * meaning of a particular non-standard command; this reply is useful
   * only to the human user)
   */
  HELP_MESSAGE: 214,
  /**
   * <domain> Service ready
   */
  SERVICE_READY: 220,
  /**
   * <domain> Service closing transmission channel
   */
  SERVICE_CLOSING: 221,
  /**
   * Requested mail action okay, completed
   */
  OK: 250,
  /**
   * User not local; will forward to <forward-path>
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc5321#section-3.4}
   */
  USER_NOT_LOCAL_WILL_FORWARD: 251,
  /**
   * Cannot VRFY user, but will accept message and attempt delivery
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc5321#section-3.5.3}
   */
  CANNOT_VRFY_BUT_WILL_ACCEPT: 252,
  /**
   * Start mail input; end with <CRLF>.<CRLF>
   */
  START_MAIL_INPUT: 354,
  /**
   * <domain> Service not available, closing transmission channel
   * (This may be a reply to any command if the service knows it must
   * shut down)
   */
  SERVICE_NOT_AVAILABLE: 421,
  /**
   * Requested mail action not taken: mailbox unavailable (e.g.,
   * mailbox busy or temporarily blocked for policy reasons)
   */
  MAILBOX_UNAVAILABLE_TEMP: 450,
  /**
   * Requested action aborted: local error in processing
   */
  LOCAL_ERROR: 451,
  /**
   * Requested action not taken: insufficient system storage
   */
  INSUFFICIENT_STORAGE: 452,
  /**
   * Server unable to accommodate parameters
   */
  UNABLE_TO_ACCOMMODATE_PARAMS: 455,
  /**
   * Syntax error, command unrecognized (This may include errors such
   * as command line too long)
   */
  SYNTAX_ERROR: 500,
  /**
   * Syntax error in parameters or arguments
   */
  SYNTAX_ERROR_IN_PARAMETERS: 501,
  /**
   * Command not implemented
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc5321#section-4.2.4}
   */
  COMMAND_NOT_IMPLEMENTED: 502,
  /**
   * Bad sequence of commands
   */
  BAD_SEQUENCE: 503,
  /**
   * Command parameter not implemented
   */
  COMMAND_PARAMETER_NOT_IMPLEMENTED: 504,
  /**
   * Requested action not taken: mailbox unavailable (e.g., mailbox
   * not found, no access, or command rejected for policy reasons)
   */
  MAILBOX_UNAVAILABLE: 550,
  /**
   * User not local; please try <forward-path>
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc5321#section-3.4}
   */
  USER_NOT_LOCAL_TRY_FORWARD: 551,
  /**
   * Requested mail action aborted: exceeded storage allocation
   */
  EXCEEDED_STORAGE_ALLOCATION: 552,
  /**
   * Requested action not taken: mailbox name not allowed (e.g.,
   * mailbox syntax incorrect)
   */
  MAILBOX_NAME_NOT_ALLOWED: 553,
  /**
   * Transaction failed (Or, in the case of a connection-opening
   * response, "No SMTP service here")
   */
  TRANSACTION_FAILED: 554,
  /**
   * MAIL FROM/RCPT TO parameters not recognized or not implemented
   */
  MAIL_FROM_RCPT_TO_PARAMS_NOT_RECOGNIZED: 555,
} as const satisfies Record<string, number>;
