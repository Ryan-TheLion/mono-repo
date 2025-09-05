import { type ParsedMail } from 'mailparser';
import * as ImapConnection from 'node-imap';

export type Connection = ImapConnection;

export type ConnectionState =
  | 'disconnected'
  | 'connected'
  | 'authenticated'
  | 'upgrading';

export type MailBox = 'INBOX' | 'Sent' | 'Drafts' | 'Junk' | 'Trash';

export interface ReceivedEmail
  extends Pick<
    ParsedMail,
    | 'messageId'
    | 'subject'
    | 'from'
    | 'to'
    | 'cc'
    | 'bcc'
    | 'replyTo'
    | 'inReplyTo'
    | 'attachments'
  > {
  sequenceNumber: number;
  /** mailbox name */
  mailBox: MailBox;
  /** unix timestamp in milliseconds */
  timestamp: number;
  /** email content (text or HTML) */
  content: {
    type: 'text' | 'html';
    source: string;
  };
}
