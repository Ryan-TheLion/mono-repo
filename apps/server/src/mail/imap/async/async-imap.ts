import * as ImapConnection from 'node-imap';
import { type Imap } from '../types';
import { Readable } from 'stream';
import { UnauthorizedException } from '@nestjs/common';
import { AUTH_HEADER_TOKEN_TYPE } from 'src/common/types';
import { MailCredentialDto } from 'src/mail/dto';
import { EMAIL_PROTOCOLS_PORT } from 'src/mail/port';
import { parseEmail } from '../utils';
import {
  Pagination,
  PAGINATION_RANGE,
  PaginationQuery,
  PaginationWith,
} from 'src/common/dto';
import { PaginationUtils } from 'src/common/utils';
import { SequenceMessage } from '../types/imap';

interface AsyncImapConfig {
  host: string;
  port: number;
}

const DEFAULT_PAGINATION_QUERIES: PaginationQuery = {
  page: 1,
  size: PAGINATION_RANGE.Size.min,
};

export class AsyncImap {
  constructor(private readonly connection: Imap.TypedConnection) {}

  static connect = async (
    credential: MailCredentialDto,
    { host, port }: AsyncImapConfig,
  ) => {
    const { user, token } = credential;

    if (!user || !token) throw new UnauthorizedException();

    const SOH = `\x01`;
    const END = `\x01\x01`;

    const authFormat = `user=${user}${SOH}auth=${AUTH_HEADER_TOKEN_TYPE.Bearer} ${token}${END}`;
    const saslXoauth2 = Buffer.from(authFormat, 'utf8').toString('base64');

    const autoTLS = (
      imapPort: number,
    ): Pick<Imap.ConnectionConfig, 'tls' | 'autotls'> => {
      return {
        tls: imapPort === EMAIL_PROTOCOLS_PORT.imap.secure,
        autotls:
          imapPort === EMAIL_PROTOCOLS_PORT.imap.secure ? 'never' : 'always',
      };
    };

    const connection = new ImapConnection({
      host,
      port,
      ...autoTLS(port),
      user,
      xoauth2: saslXoauth2,
    } as Imap.ConnectionConfig) as Imap.TypedConnection;

    const imapClient = new AsyncImap(connection);

    await imapClient.waitUntilConnected();

    return imapClient;
  };

  /** The current state of the connection (e.g. 'disconnected', 'connected', 'authenticated') */
  get connectionState(): Imap.ConnectionState {
    return this.connection.state as Imap.ConnectionState;
  }

  private get _selectedBox() {
    const connection = this.connection as Imap.TypedConnection & {
      _box: Imap.SelectedBox | undefined;
    };

    const box = connection._box;

    return box;
  }

  private waitUntilConnected() {
    const connection = this.connection;

    return new Promise<void>((resolve, reject) => {
      connection.once('ready', resolve);
      connection.once('error', reject);

      connection.connect();
    });
  }

  closeConnection() {
    this.connection.end();
  }

  private selectBox = async (
    mailBox: Imap.MailBox,
    {
      readOnly,
      autoExpunge,
    }: { readOnly?: boolean; autoExpunge?: boolean } = {},
  ) => {
    const selectedBox = this._selectedBox;

    if (selectedBox) {
      if (selectedBox.name === mailBox) {
        return selectedBox;
      }

      await this.closeBox({ autoExpunge });

      return await this.openMailBox(mailBox, { readOnly });
    }

    return await this.openMailBox(mailBox, { readOnly });
  };

  private openMailBox = (
    mailBox: Imap.MailBox,
    { readOnly = false }: { readOnly?: boolean } = {},
  ): Promise<Imap.SelectedBox> => {
    return new Promise((resolve, reject) => {
      const callback = (error: Error, box: Imap.SelectedBox) => {
        if (error) return reject(error);

        resolve(box);
      };

      this.connection.openBox(mailBox, readOnly, callback);
    });
  };

  private closeBox = ({
    autoExpunge = true,
  }: { autoExpunge?: boolean } = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      const callback = (error: Error) => {
        if (error) return reject(error);

        resolve();
      };

      this.connection.closeBox(autoExpunge, callback);
    });
  };

  private fetchMessages = async ({
    uids,
    query = DEFAULT_PAGINATION_QUERIES,
    markSeen,
  }: {
    uids?: number[];
    query?: PaginationQuery;
    markSeen?: boolean;
  } = {}): Promise<Imap.SequenceMessage[]> => {
    const sortedUids = uids?.length ? uids : await this.sort(['-ARRIVAL']);

    if (!sortedUids?.length) {
      return [];
    }

    const pageUids = PaginationUtils.slicePage(sortedUids, {
      size: query.size,
    }).at(query.page);

    if (!pageUids.length) {
      return [];
    }

    const messagesPromise = () =>
      new Promise<Imap.SequenceMessage[]>((resolve, reject) => {
        // 오름차순으로 메시지가 전달 됨 => 정렬을 유지하기 위해 map을 활용
        const sortedMessageMap = new Map<number, SequenceMessage>(
          pageUids.map((uid) => [uid, {} as SequenceMessage]),
        );

        const fetch = this.connection.fetch(pageUids, {
          bodies: '',
          struct: true,
          ...(markSeen != null && { markSeen }),
        }) as Imap.TypedFetch;

        fetch.on('message', (message: Imap.TypedMessage) => {
          let sequenceMessage = {} as Imap.SequenceMessage;

          message.once('body', (stream, info) => {
            sequenceMessage = {
              ...sequenceMessage,
              stream: stream as Readable,
              info,
            };
          });

          message.once('attributes', (attrs) => {
            sequenceMessage = {
              ...sequenceMessage,
              attrs,
            };
          });

          message.once('end', () => {
            sortedMessageMap.set(sequenceMessage.attrs.uid, sequenceMessage);
          });
        });

        fetch.once('error', (error) => {
          reject(error);
        });

        fetch.once('end', () => {
          const messages = Array.from(sortedMessageMap.values());

          resolve(messages);
        });
      });

    return await messagesPromise();
  };

  private sort = (
    sortCriteria: Imap.SortCriteria[],
    searchCriteria: Imap.SearchCriteria[] = ['ALL'],
  ): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      this.connection.sort(sortCriteria, searchCriteria, (error, uids) => {
        if (error) return reject(error);

        resolve(uids);
      });
    });
  };

  getMails = async (
    mailBox: Imap.MailBox,
    {
      query = DEFAULT_PAGINATION_QUERIES,
      criteria,
      readOnly,
      markSeen,
      autoClose = true,
    }: {
      query?: PaginationQuery;
      criteria?: {
        search: Imap.SearchCriteria[];
        sort?: Imap.SortCriteria[];
      };
      readOnly?: boolean;
      markSeen?: boolean;
      autoClose?: boolean;
    } = {},
  ): Promise<PaginationWith<{ mails: Imap.ReceivedEmail[] }>> => {
    const box = await this.selectBox(mailBox, { readOnly });

    const fetchCriteria = {
      search: criteria?.search ?? ['ALL'],
      sort: criteria?.sort ?? ['-ARRIVAL'],
    };

    const uids = await this.sort(fetchCriteria.sort, fetchCriteria.search);

    const range = PaginationUtils.range({ total: box.messages.total, query });

    if (range.empty || range.overflow)
      return Pagination.of({ mails: [] }).paginate({
        total: box.messages.total,
        query,
      });

    const messages = await this.fetchMessages({
      uids,
      query,
      markSeen,
    });

    const receivedEmails = await Promise.all(
      messages.map((message) => parseEmail(mailBox, message)),
    );

    if (autoClose) await this.closeBox();

    return Pagination.of({ mails: receivedEmails }).paginate({
      total: box.messages.total,
      query,
    });
  };
}
