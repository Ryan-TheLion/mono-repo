import { type AnyFunction } from 'src/common/types';
import { type Imap } from '.';
import { type MailCredentialDto } from 'src/mail/dto/credential.dto';
import { type ReceivedEmail } from './imap';
import { type Box } from 'node-imap';

type ImapMethod<Fn extends AnyFunction> = (
  connection: Imap.Connection,
  ...params: Parameters<Fn>
) => ReturnType<Fn>;

export type OmitConnection<Fn> = Fn extends (
  connection: Imap.Connection,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;

export type GetMailBox = ImapMethod<
  (
    credential: MailCredentialDto,
    mailBox: Imap.MailBox,
  ) => Promise<{ mails: ReceivedEmail[]; counts: Box['messages'] }>
>;

export interface ImapServiceMethods {
  getMailBox: OmitConnection<GetMailBox>;
}
