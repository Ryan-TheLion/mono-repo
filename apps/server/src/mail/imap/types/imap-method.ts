import { type AnyFunction } from 'src/common/types';
import { type Imap } from '.';
import { type MailCredentialDto } from 'src/mail/dto';
import { type PaginationQuery, type PaginationWith } from 'src/common/dto';

type ImapMethod<Fn extends AnyFunction> = (
  credential: MailCredentialDto,
  ...params: Parameters<Fn>
) => ReturnType<Fn>;

export type GetMailsOption = {
  query?: PaginationQuery;
  criteria?: {
    search: Imap.SearchCriteria[];
    sort?: Imap.SortCriteria[];
  };
  markSeen?: boolean;
};

export type GetMails = ImapMethod<
  (
    mailBox: Imap.MailBox,
    options?: GetMailsOption,
  ) => Promise<PaginationWith<{ mails: Imap.ReceivedEmail[] }>>
>;

export interface ImapServiceMethods {
  getMails: GetMails;
}
