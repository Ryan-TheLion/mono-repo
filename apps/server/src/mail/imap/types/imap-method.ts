import { type AnyFunction } from 'src/common/types';
import { type Imap } from '.';
import { type MailCredentialDto } from 'src/mail/dto/credential.dto';
import { type ReceivedEmail } from './imap';
import { GetMailBoxQuery } from 'src/mail/dto';
import { type PaginationWith } from 'src/common/dto';

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
    queries: GetMailBoxQuery,
  ) => Promise<PaginationWith<{ mails: ReceivedEmail[] }>>
>;

export interface ImapServiceMethods {
  getMailBox: OmitConnection<GetMailBox>;
}
