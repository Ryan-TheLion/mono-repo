import { type Imap } from './types';

export const IMAP_MAILBOX = {
  inBox: 'INBOX',
  sent: 'Sent',
  draft: 'Drafts',
  spam: 'Junk',
  trash: 'Trash',
} as const satisfies Record<string, Imap.MailBox>;

export const IMAP_CONNECTION_STATE = {
  connected: 'connected',
  authenticated: 'authenticated',
  disconnected: 'disconnected',
  upgrading: 'upgrading',
} as const satisfies Record<string, Imap.ConnectionState>;

export const IMAP_MAILBOXES: ReadonlyArray<Imap.MailBox> = [
  'INBOX',
  'Sent',
  'Drafts',
  'Junk',
  'Trash',
];
