import { IsIn } from 'class-validator';
import { type Imap } from '../imap/types';
import { type ReceivedEmail } from '../imap/types/imap';
import { IMAP_MAILBOXES } from '../imap/imap.constants';
import {
  Pagination,
  PaginationQuery,
  type PaginationWith,
} from 'src/common/dto';

export class GetMailsParam {
  @IsIn(IMAP_MAILBOXES)
  box: Imap.MailBox;
}

export class GetMailsQuery extends PaginationQuery {}

interface GetMailsPayload {
  mails: ReceivedEmail[];
}

export class GetMailsResponseDto implements PaginationWith<GetMailsPayload> {
  mails: ReceivedEmail[];

  pagination: Pagination;
}
