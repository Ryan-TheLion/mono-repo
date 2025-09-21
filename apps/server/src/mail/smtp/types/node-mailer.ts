import {
  type SentMessageInfo as SmtpConnectionSentMessageInfo,
  type CustomAuthenticationContext,
} from 'nodemailer/lib/smtp-connection';
import { type SentMessageInfo as SmtpTransportSentMessageInfo } from 'nodemailer/lib/smtp-transport';

type BaseSendMailResponse = SmtpTransportSentMessageInfo &
  Omit<SmtpConnectionSentMessageInfo, keyof SmtpTransportSentMessageInfo>;

export interface NodeMailerSendMailResponse extends BaseSendMailResponse {
  ehlo: string[];
}

export type NodeMailerCustomAuthenticationHandler = (
  ctx: CustomAuthenticationContext,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
) => Promise<boolean> | unknown;
