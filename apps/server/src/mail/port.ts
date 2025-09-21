import { type FlattenRecordValues } from 'src/common/types';

export type EmailPort = FlattenRecordValues<typeof EMAIL_PROTOCOLS_PORT>;

export const EMAIL_PROTOCOLS_PORT = {
  smtp: {
    /** Standard SMTP */
    standard: 25,
    /** SMTP over SSL/TLS */
    secure: 465,
    /** SMTP Submission */
    submission: 587,
  },
  imap: {
    /** Standard IMAP */
    standard: 143,
    /** IMAP over SSL/TLS */
    secure: 993,
  },
} as const;

const emailPortSet = new Set([
  ...Object.values(EMAIL_PROTOCOLS_PORT.smtp),
  ...Object.values(EMAIL_PROTOCOLS_PORT.imap),
]);

export const isEmailPort = (port: number): port is EmailPort => {
  return emailPortSet.has(port as EmailPort);
};
