import { type Transporter, type SendMailOptions } from 'nodemailer';
import { type AnyFunction } from 'src/common/types';
import { type NodeMailerSendMailResponse } from './node-mailer';

type SmtpMethod<Fn extends AnyFunction> = (
  transporter: Transporter,
  ...params: Parameters<Fn>
) => ReturnType<Fn>;

export type OmitTransporter<Fn> = Fn extends (
  transporter: Transporter,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;

export type SendMail = SmtpMethod<
  (options: SendMailOptions) => Promise<NodeMailerSendMailResponse>
>;

export interface SmtpServiceMethods {
  sendMail: OmitTransporter<SendMail>;
}
