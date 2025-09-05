import { IsIn } from 'class-validator';
import { type Imap } from '../imap/types';
import { type ReceivedEmail } from '../imap/types/imap';
import { IMAP_MAILBOXES } from '../imap/imap.constants';
import {
  Pagination,
  PaginationQuery,
  type PaginationWith,
} from 'src/common/dto';

export class GetMailBoxParams {
  @IsIn(IMAP_MAILBOXES)
  box: Imap.MailBox;
}

export class GetMailBoxQuery extends PaginationQuery {}

interface GetMailBoxPayload {
  mails: ReceivedEmail[];
}

export class GetMailBoxResponseDto
  implements PaginationWith<GetMailBoxPayload>
{
  mails: ReceivedEmail[];

  pagination: Pagination;
}
