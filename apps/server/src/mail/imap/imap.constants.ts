import { type Imap } from './types';

export const IMAP_MAILBOXES_MAP = {
  inBox: 'INBOX',
  sent: 'Sent',
  draft: 'Drafts',
  spam: 'Junk',
  trash: 'Trash',
} as const satisfies Record<string, Imap.MailBox>;

export const IMAP_MAILBOXES: ReadonlyArray<Imap.MailBox> = [
  'INBOX',
  'Sent',
  'Drafts',
  'Junk',
  'Trash',
];
