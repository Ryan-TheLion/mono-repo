import { type EmailAddress, type ParsedMail } from 'mailparser';
import * as ImapConnection from 'node-imap';
import { EventEmitter } from 'events';
import { type Readable } from 'stream';
import { type ImapSearchCriteria } from './search-criteria';

export type Connection = ImapConnection;

type BaseTypedConnection = Omit<
  ImapConnection,
  keyof ImapEventEmitter | 'search' | 'sort'
> &
  ImapEventEmitter;

export interface TypedConnection extends BaseTypedConnection {
  /**
   * Searches the currently open mailbox for messages using given criteria.
   * criteria is a list describing what you want to find.
   * For criteria types that require arguments, use an array instead of just the string criteria type name (e.g. ['FROM', 'foo@bar.com']).
   * Prefix criteria types with an "!" to negate.
   */
  search(
    criteria: ImapSearchCriteria.Any[],
    callback: (error: Error, uids: number[]) => void,
  ): void;

  /**
   * Sorts the currently open mailbox for messages using given sortCriteria.
   * This method first searches the mailbox for messages that match the given searching criteria and then sorts by given sort criteria.
   * (This is a specification of RFC 5256. )
   */
  sort(
    sortCriteria: ImapConnection.SortCriteria[],
    searchCriteria: ImapSearchCriteria.Any[],
    callback: (error: Error, uids: number[]) => void,
  ): void;
}

export type ConnectionState =
  | 'disconnected'
  | 'connected'
  | 'authenticated'
  | 'upgrading';

export interface ConnectionConfig
  extends Omit<ImapConnection.Config, 'autotls'> {
  /** Set to 'always' to always attempt connection upgrades via STARTTLS, 'required' only if upgrading is required, or 'never' to never attempt upgrading. Default: 'never' */
  autotls?: AutoTLS;
}

export type AutoTLS = 'always' | 'required' | 'never';

/**
 * MessageSource can be a single message identifier,
 * a message identifier range
 * (e.g. `'2504:2507'` or `'*'` or `'2504:*'`),
 * an array of message identifiers,
 * or an array of message identifier ranges.
 *
 * @see {@link https://www.npmjs.com/package/node-imap#data-types}
 */
export type MessageSource = string | (string | number)[];

export type Box = ImapConnection.Box;

/**
 * 추가된 속성인 highestmodseq가 반영된 Box 타입
 *
 * - RFC4551
 *
 * The Box type can now have the following property when using openBox() or status():
 *
 * `highestmodseq` \- string \- The highest modification sequence value of all messages in the mailbox.
 *
 * @see {@link https://www.npmjs.com/package/node-imap#extensions-supported}
 */
export type SelectedBox = ImapConnection.Box & { highestmodseq: string };

export type MailBoxes = ImapConnection.MailBoxes;

export type SortCriteria = ImapConnection.SortCriteria;

export type SearchCriteria = ImapSearchCriteria.Any;

export type MailBox = 'INBOX' | 'Sent' | 'Drafts' | 'Junk' | 'Trash';

export type Message = ImapConnection.ImapMessage;

export interface TypedMessage extends Omit<ImapConnection.ImapMessage, 'on'> {
  /**
   *  Emitted for each requested body.
   *
   *  Example `info` properties:
   *
   *  - which - string - The specifier for this body (e.g. 'TEXT', 'HEADER.FIELDS (TO FROM SUBJECT)', etc).
   *  - size - integer - The size of this body in bytes.
   */
  on(
    event: 'body',
    listener: (
      stream: NodeJS.ReadableStream,
      info: ImapConnection.ImapMessageBodyInfo,
    ) => void,
  ): TypedMessage;
  /**
   * Emitted when all message attributes have been collected.
   *
   * Example attrs properties:
   *
   * - uid - integer - A 32-bit ID that uniquely identifies this message within its mailbox.
   * - flags - array - A list of flags currently set on this message.
   * - date - Date - The internal server date for the message.
   * - struct - array - The message's body structure (only set if requested with fetch()). See below for an explanation of the format of this property.
   * - size - integer - The RFC822 message size (only set if requested with fetch()).
   */
  on(
    event: 'attributes',
    listener: (attrs: ImapConnection.ImapMessageAttributes) => void,
  ): TypedMessage;
  /** Emitted when all attributes and bodies have been parsed */
  on(event: 'end', listener: () => void): TypedMessage;

  /**
   *  Emitted for each requested body.
   *
   *  Example `info` properties:
   *  - which - string - The specifier for this body (e.g. 'TEXT', 'HEADER.FIELDS (TO FROM SUBJECT)', etc).
   *  - size - integer - The size of this body in bytes.
   */
  once(
    event: 'body',
    listener: (
      stream: NodeJS.ReadableStream,
      info: ImapConnection.ImapMessageBodyInfo,
    ) => void,
  ): TypedMessage;
  /**
   * Emitted when all message attributes have been collected.
   *
   * Example attrs properties:
   *
   * - uid - integer - A 32-bit ID that uniquely identifies this message within its mailbox.
   * - flags - array - A list of flags currently set on this message.
   * - date - Date - The internal server date for the message.
   * - struct - array - The message's body structure (only set if requested with fetch()). See below for an explanation of the format of this property.
   * - size - integer - The RFC822 message size (only set if requested with fetch()).
   */
  once(
    event: 'attributes',
    listener: (attrs: ImapConnection.ImapMessageAttributes) => void,
  ): TypedMessage;
  /** Emitted when all attributes and bodies have been parsed */
  once(event: 'end', listener: () => void): TypedMessage;
}

export type MessageAttributes = ImapConnection.ImapMessageAttributes;

export type SequenceMessage = {
  stream: Readable;
  info: ImapConnection.ImapMessageBodyInfo;
  attrs: ImapConnection.ImapMessageAttributes;
};

export type MessageBodyInfo = ImapConnection.ImapMessageBodyInfo;

export interface ReceivedEmail
  extends Pick<
    ParsedMail,
    | 'messageId'
    | 'subject'
    | 'inReplyTo'
    | 'priority'
    | 'references'
    | 'attachments'
  > {
  uid: number;
  /** mailbox name */
  mailBox: MailBox;
  flags: string[];
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  /** unix timestamp in milliseconds */
  timestamp: number;
  /** email content (text or HTML) */
  content: {
    type: 'text' | 'html';
    source: string;
  };
}

export type Fetch = ImapConnection.ImapFetch;

export type FetchOptions = ImapConnection.FetchOptions;

export interface TypedFetch
  extends Omit<ImapConnection.ImapFetch, 'on' | 'once'> {
  /**
   * Emitted for each message resulting from a fetch request.
   * seqno is the message's sequence number
   */
  on(
    event: 'message',
    listener: (message: TypedMessage, seqno: number) => void,
  ): this;
  /**  Emitted when an error occurred */
  on(event: 'error', listener: (error: Error) => void): TypedFetch;
  /** Emitted when all messages have been parsed */
  on(event: 'end', listener: () => void): TypedFetch;

  /**
   * Emitted for each message resulting from a fetch request.
   * seqno is the message's sequence number
   */
  once(
    event: 'message',
    listener: (message: TypedMessage, seqno: number) => void,
  ): this;
  /**  Emitted when an error occurred */
  once(event: 'error', listener: (error: Error) => void): TypedFetch;
  /** Emitted when all messages have been parsed */
  once(event: 'end', listener: () => void): TypedFetch;
}

type SystemFlag = `Seen` | 'Answered' | 'Flagged' | 'Deleted' | 'Draft';

export type Flag = `\\${SystemFlag}`;

export type ConnectionEvent =
  | 'ready'
  | 'alert'
  | 'mail'
  | 'expunge'
  | 'uidvalidity'
  | 'update'
  | 'error'
  | 'close'
  | 'end';

export type ConnectionErrorSource =
  | 'timeout-auth'
  | 'socket'
  | 'socket-timeout'
  | 'timeout'
  | 'protocol'
  | 'authentication';

export interface ConnectionError extends Error {
  source: ConnectionErrorSource;
}

/**
 * connection event 리스너(콜백)
 *
 * @see {@link https://www.npmjs.com/package/node-imap#connection-events}
 */
interface ConnectionEventListener {
  /** Emitted when a connection to the server has been made and authentication was successful. */
  ready: () => void;
  /** Emitted when the server issues an alert (e.g. "the server is going down for maintenance") */
  alert: (message: string) => void;
  /** Emitted when new mail arrives in the currently open mailbox */
  mail: (newMsgs: number) => void;
  /** Emitted when a message was expunged externally. seqno is the sequence number (instead of the unique UID) of the message that was expunged. If you are caching sequence numbers, all sequence numbers higher than this value MUST be decremented by 1 in order to stay synchronized with the server and to keep correct continuity */
  expunge: (seqno: number) => void;
  /** Emitted if the UID validity value for the currently open mailbox changes during the current session */
  uidvalidity: (uidvalidity: number) => void;
  /** Emitted when message metadata (e.g. flags) changes externally */
  update: (seqno: number, info: Record<any, any>) => void;
  /** Emitted when an error occurs. The 'source' property will be set to indicate where the error originated from */
  error: (error: ConnectionError) => void;
  /** Emitted when the connection has completely closed */
  close: (hadError: boolean) => void;
  /** Emitted when the connection has ended */
  end: () => void;
}

type EventEmitterMap = {
  [K in keyof ConnectionEventListener]: Parameters<ConnectionEventListener[K]>;
};

type ImapEventEmitter = EventEmitter<EventEmitterMap>;
