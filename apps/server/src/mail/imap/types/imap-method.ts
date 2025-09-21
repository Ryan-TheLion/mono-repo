import { type AnyFunction } from 'src/common/types';
import { type Imap } from '.';
import { type PaginationQuery, type PaginationWith } from 'src/common/dto';
import { type AsyncImap } from '../async';

type ImapMethod<Fn extends AnyFunction> = (
  imap: AsyncImap,
  ...params: Parameters<Fn>
) => ReturnType<Fn>;

type OmitImap<Fn> = Fn extends (imap: AsyncImap, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;

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
  getMails: OmitImap<GetMails>;
}
