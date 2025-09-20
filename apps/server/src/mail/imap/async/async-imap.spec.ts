import * as Connection from 'node-imap';
import * as EventEmitter from 'events';
import { AddressObject, ParsedMail, simpleParser } from 'mailparser';
import { Imap } from '../types';
import { AsyncImap, AsyncImapConfig } from './async-imap';
import { EMAIL_PROTOCOLS_PORT } from 'src/mail/port';
import { MailCredentialDto } from 'src/mail/dto';
import { AUTH_HEADER_TOKEN_TYPE } from 'src/common/types';
import { UnauthorizedException } from '@nestjs/common';
import {
  createBuilder,
  getStream,
  PaginationUtils,
  shuffle,
} from 'src/common/utils';
import { ImapSearchCriteria } from '../types/search-criteria';
import { Pagination, PAGINATION_RANGE, PaginationQuery } from 'src/common/dto';

jest.mock('node-imap');

jest.mock('mailparser', () => {
  const actual = jest.requireActual<typeof import('mailparser')>('mailparser');

  return {
    ...actual,
    simpleParser: jest.fn(),
  };
});

jest.mock('src/common/utils', () => {
  const actual =
    jest.requireActual<typeof import('src/common/utils')>('src/common/utils');

  return {
    ...actual,
    getStream: jest.fn(),
  };
});

const DEFAULT_PAGINATION_QUERIES: PaginationQuery = {
  page: 1,
  size: PAGINATION_RANGE.Size.min,
};

const DEFAULT_CRITERIA: {
  sort: Imap.SortCriteria[];
  search: ImapSearchCriteria.Any[];
} = {
  sort: ['-ARRIVAL'],
  search: ['ALL'],
};

const mockGetStream = jest.mocked(getStream);

const mockSimpleParser = jest.mocked(simpleParser);

class MockMessageMap extends Map<
  number,
  { seqno: number; uid: number; message: MockMessage }
> {
  initMockMessageMap = (uids: number[]) => {
    this.clearMockMessageMap();

    for (let i = 0; i < uids.length; i++) {
      const seqno = i + 1;
      const uid = uids[i];

      const message = new MockMessage();

      this.set(uid, { seqno, uid, message });
    }
  };

  clearMockMessageMap = () => {
    if (!this.size) return;

    this.forEach(({ message }) => {
      message.removeAllListeners();
    });

    this.clear();
  };
}

class MockConnection extends EventEmitter {
  constructor() {
    super();

    this.emit = super.emit.bind(this) as Imap.TypedConnection['emit'];
  }

  emit: Imap.TypedConnection['emit'];

  _box?: Imap.SelectedBox;

  state: Imap.ConnectionState = 'disconnected';

  connect: jest.MockedFn<Imap.TypedConnection['connect']> = jest.fn();

  end: jest.MockedFn<Imap.TypedConnection['end']> = jest.fn();

  openBox: jest.MockedFn<
    (
      mailBox: Imap.MailBox,
      readOnly: boolean,
      callback: (error: Error, box: Imap.SelectedBox) => void,
    ) => void
  > = jest.fn();

  closeBox: jest.MockedFn<Imap.TypedConnection['closeBox']> = jest.fn();

  fetch: jest.MockedFn<Imap.TypedConnection['fetch']> = jest.fn();

  sort: jest.MockedFn<Imap.TypedConnection['sort']> = jest.fn();
}

class ConnectionError extends Error {
  source: Imap.ConnectionErrorSource;

  constructor({
    message,
    source,
  }: {
    message?: string;
    source: Imap.ConnectionErrorSource;
  }) {
    super(message);

    this.source = source;
  }
}

class MockFetch extends EventEmitter {
  constructor() {
    super();

    this.on = super.on.bind(this) as Imap.TypedFetch['on'];
  }

  // @ts-expect-error - this
  on: Imap.TypedFetch['on'];
}

class MockMessage extends EventEmitter {}

const createSaslXoauth2 = ({ user, token }: MailCredentialDto) => {
  const SOH = `\x01`;
  const END = `\x01\x01`;

  const authFormat = `user=${user}${SOH}auth=${AUTH_HEADER_TOKEN_TYPE.Bearer} ${token}${END}`;

  return Buffer.from(authFormat, 'utf8').toString('base64');
};

const createMockSelectedBox = ({
  mailBox,
  uids,
  flags = ['\\Seen', '\\Flagged', '\\Answered', '\\Deleted', '\\Draft'],
  readOnly,
}: {
  mailBox: Imap.MailBox;
  uids: number[];
  flags?: Imap.Flag[];
  readOnly?: boolean;
}) => {
  return createBuilder<Imap.SelectedBox>()
    .flags(flags)
    .permFlags([])
    .messages({ total: uids.length, new: 0, unseen: 0 })
    .newKeywords(false)
    .highestmodseq(`${uids.length ? uids.length + 1 : 0}`)
    .name(mailBox)
    .persistentUIDs(true)
    .readOnly(readOnly ?? false)
    .uidnext(0)
    .uidvalidity(0)
    .build();
};

const fetchMockMessages = ({
  mockFetch,
  mockMessageMap,
}: {
  mockFetch: MockFetch;
  mockMessageMap: MockMessageMap;
}) => {
  mockMessageMap.forEach(({ seqno, uid, message }) => {
    mockFetch.emit('message', message, seqno);

    message.emit('attributes', { uid });

    message.emit('end');
  });

  mockFetch.emit('end');
};

describe('Async Imap', () => {
  let mockConnection: MockConnection;

  const asyncImapConfig: AsyncImapConfig = {
    host: 'imap.test.com',
    port: EMAIL_PROTOCOLS_PORT.imap.standard,
  };

  const credential: MailCredentialDto = {
    user: 'user@email.com',
    token: 'accessToken',
  };

  beforeEach(() => {
    mockConnection = new MockConnection();

    jest
      .mocked(Connection)
      .mockImplementation(() => mockConnection as unknown as Connection);
  });

  afterEach(() => {
    mockConnection.removeAllListeners();

    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('connect', () => {
    it('설정한 credential과 config로 imap connection 이 생성되어야 한다', async () => {
      const config = {
        ...asyncImapConfig,
        host: 'imap.custom.com',
      };

      const onReady = jest.fn();
      mockConnection.once('ready', onReady);

      const onError = jest.fn();
      mockConnection.once('error', onError);

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const asyncImap = await AsyncImap.connect(credential, config);

      expect(asyncImap).toBeInstanceOf(AsyncImap);

      expect(asyncImap['connection']).toEqual(mockConnection);

      expect(Connection).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          host: config.host,
          port: config.port,
          user: credential.user,
          xoauth2: createSaslXoauth2(credential),
        } as Imap.ConnectionConfig),
      );

      expect(onReady).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('connect 중 에러 발생시 해당 에러를 전파해야 한다', async () => {
      const onReady = jest.fn();
      mockConnection.once('ready', onReady);

      const onError = jest.fn();
      mockConnection.once('error', onError);

      const error = new ConnectionError({
        message: 'mock connection error',
        source: 'authentication',
      });

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('error', error);
      });

      await expect(
        AsyncImap.connect(credential, asyncImapConfig),
      ).rejects.toEqual(error);

      expect(onReady).not.toHaveBeenCalled();
      expect(onError).toHaveBeenNthCalledWith(1, error);
    });

    describe('invalid credential', () => {
      it.each<[MailCredentialDto]>([
        [{ user: '', token: 'accessToken' }],
        [{ user: 'email', token: '' }],
        [{ user: '', token: '' }],
      ])(
        'AsyncImap.connect(%o, options) 호출시 UnauthorizedException 이 발생해야 한다',
        async (invalidCredential) => {
          await expect(
            AsyncImap.connect(invalidCredential, asyncImapConfig),
          ).rejects.toBeInstanceOf(UnauthorizedException);

          expect(Connection).not.toHaveBeenCalled();
        },
      );
    });
  });

  describe('connectionState', () => {
    it('asyncImap.connectionState를 통해 현재 connection.state에 접근할 수 있어야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      expect(asyncImap.connectionState).toEqual(mockConnection.state);
    });
  });

  describe('selectBox', () => {
    const mailBox: Imap.MailBox = 'INBOX';

    const selectedBox = createMockSelectedBox({
      mailBox,
      uids: [],
    });

    it('_selectedBox가 있고 이름이 mailBox와 같은 경우, 현재 _selectedBox를 반환한다', async () => {
      const targetMailBox: Imap.MailBox = 'Sent';

      const currentBox = {
        ...selectedBox,
        name: targetMailBox,
      };

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection._box = currentBox;

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const box = await asyncImap['selectBox'](targetMailBox);

      expect(box).toEqual(asyncImap['_selectedBox']);

      expect(mockConnection.closeBox).not.toHaveBeenCalled();
    });

    it('_selectedBox가 존재하고 요청한 mailBox와 이름이 다를 때, 기존 박스를 closeBox하고 요청한 mailBox이름으로 openBox한다', async () => {
      const targetMailBox: Imap.MailBox = 'Sent';

      const selectBoxOptions = {
        readOnly: true,
        autoExpunge: false,
      } satisfies Partial<{
        readOnly: boolean;
        autoExpunge: boolean;
      }>;

      const targetSelectedBox = {
        ...selectedBox,
        name: targetMailBox,
      };

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection.openBox.mockImplementation(
        (mailBox, readOnly, callback) => {
          callback(null as unknown as Error, targetSelectedBox);
        },
      );

      mockConnection.closeBox.mockImplementation((autoExpunge, callback) => {
        callback(null as unknown as Error);
      });

      mockConnection._box = selectedBox;

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const box = await asyncImap['selectBox'](targetMailBox, selectBoxOptions);
      mockConnection._box = box;

      expect(box).toEqual(targetSelectedBox);
      expect(box.name).not.toEqual(selectedBox.name);

      expect(mockConnection.closeBox).toHaveBeenNthCalledWith(
        1,
        selectBoxOptions.autoExpunge,
        expect.any(Function),
      );

      expect(mockConnection.openBox).toHaveBeenNthCalledWith(
        1,
        targetMailBox,
        selectBoxOptions.readOnly,
        expect.any(Function),
      );
    });

    it('_selectedBox가 존재하지 않으면 요청한 mailBox로 openBox 하고 해당 box 를 반환한다', async () => {
      const selectBoxOptions = {
        readOnly: selectedBox.readOnly,
        autoExpunge: true,
      } satisfies Partial<{
        readOnly: boolean;
        autoExpunge: boolean;
      }>;

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection.openBox.mockImplementation(
        (mailBox, readOnly, callback) => {
          callback(null as unknown as Error, selectedBox);
        },
      );

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const box = await asyncImap['selectBox'](mailBox, selectBoxOptions);

      expect(box).toEqual(selectedBox);
      expect(box.name).toBe(mailBox);

      expect(mockConnection.closeBox).not.toHaveBeenCalled();

      expect(mockConnection.openBox).toHaveBeenNthCalledWith(
        1,
        mailBox,
        selectBoxOptions.readOnly,
        expect.any(Function),
      );
    });

    describe('_selectedBox', () => {
      it('openBox 호출 전에는 _selectedBox가 undefined를 반환해야한다', async () => {
        mockConnection.connect.mockImplementation(() => {
          mockConnection.emit('ready');
        });

        const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

        expect(asyncImap['_selectedBox']).toBeUndefined();
      });

      it('openBox 성공 시 _selectedBox를 통해 선택된 박스에 접근할 수 있어야 한다', async () => {
        mockConnection.connect.mockImplementation(() => {
          mockConnection.emit('ready');
        });

        mockConnection.openBox.mockImplementation(
          (mailBox, readOnly: boolean, callback) => {
            callback(null as unknown as Error, selectedBox);
          },
        );

        const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

        const box = await asyncImap['openMailBox'](mailBox);
        mockConnection._box = box;

        expect(asyncImap['_selectedBox']).toEqual(box);
      });
    });
  });

  describe('closeConnection', () => {
    it('closeConnection 호출 시 connection.end가 호출되어야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      asyncImap.closeConnection();

      expect(mockConnection.end).toHaveBeenCalledTimes(1);
    });
  });

  describe('openMailBox', () => {
    const mailBox: Imap.MailBox = 'INBOX';

    it.each`
      option                | expectedOption
      ${undefined}          | ${{ readOnly: false }}
      ${{}}                 | ${{ readOnly: false }}
      ${{ readOnly: true }} | ${{ readOnly: true }}
    `(
      `openMailBox(mailBox, $option) 호출 시 connection.openBox(mailBox, $expectedOption, callback) 결과를 반환해야 한다`,
      async ({
        option,
        expectedOption,
      }: {
        option: { readOnly?: boolean } | undefined;
        expectedOption: { readOnly: boolean };
      }) => {
        mockConnection.connect.mockImplementation(() => {
          mockConnection.emit('ready');
        });

        const selectedBox = createMockSelectedBox({
          mailBox,
          uids: [],
          readOnly: expectedOption.readOnly,
        });

        mockConnection.openBox.mockImplementation(
          (mailBox, readOnly, callback) => {
            callback(null as unknown as Error, selectedBox);
          },
        );

        const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

        const box = await asyncImap['openMailBox'](mailBox, option);

        expect(box).toEqual(selectedBox);

        expect(mockConnection.openBox).toHaveBeenNthCalledWith(
          1,
          mailBox,
          expectedOption.readOnly,
          expect.any(Function),
        );
      },
    );

    it('connection.openBox에서 에러 발생시 해당 에러를 전파해야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const error = new Error('mock openBox error');

      mockConnection.openBox.mockImplementation(
        (mailBox, readOnly, callback) => {
          callback(error, null as unknown as Imap.SelectedBox);
        },
      );

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      await expect(asyncImap['openMailBox'](mailBox)).rejects.toEqual(error);
    });
  });

  describe('closeBox', () => {
    it.each`
      option                    | expectedOption
      ${undefined}              | ${{ autoExpunge: true }}
      ${{}}                     | ${{ autoExpunge: true }}
      ${{ autoExpunge: false }} | ${{ autoExpunge: false }}
    `(
      `closeBox($option) 호출 시 connection.closeBox($expectedOption, callback)가 호출되어야 한다`,
      async ({
        option,
        expectedOption,
      }: {
        option: { autoExpunge?: boolean } | undefined;
        expectedOption: { autoExpunge: boolean };
      }) => {
        mockConnection.connect.mockImplementation(() => {
          mockConnection.emit('ready');
        });

        mockConnection.closeBox.mockImplementation((autoExpunge, callback) => {
          callback(null as unknown as Error);
        });

        const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

        await asyncImap['closeBox'](option);

        expect(mockConnection.closeBox).toHaveBeenNthCalledWith(
          1,
          expectedOption.autoExpunge,
          expect.any(Function),
        );
      },
    );

    it('connection.closeBox에서 에러 발생시 해당 에러를 전파해야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const error = new Error('mock closeBox error');

      mockConnection.closeBox.mockImplementation((autoExpunge, callback) => {
        callback(error);
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      await expect(asyncImap['closeBox']()).rejects.toEqual(error);
    });
  });

  describe('fetchMessages', () => {
    const sortedUids = [4, 3, 2, 1];

    const mockMessageMap: MockMessageMap = new MockMessageMap();

    let mockFetch: MockFetch;

    beforeEach(() => {
      mockFetch = new MockFetch();

      mockMessageMap.initMockMessageMap(sortedUids);
    });

    afterEach(() => {
      mockFetch.removeAllListeners();

      mockMessageMap.clearMockMessageMap();
    });

    it('sortedUids 가 빈 배열인 경우 fetch를 호출하지 않고 [] 을 반환해야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection.sort.mockImplementation(
        (sortCriteria, searchCriteria, callback) => {
          callback(null as unknown as Error, []);
        },
      );

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const messages = await asyncImap['fetchMessages']();

      expect(messages).toEqual([]);

      expect(mockConnection.fetch).not.toHaveBeenCalled();
    });

    it('pageUids 가 빈 배열인 경우 fetch를 호출하지 않고 [] 을 반환해야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection.sort.mockImplementation(
        (sortCriteria, searchCriteria, callback) => {
          callback(null as unknown as Error, sortedUids);
        },
      );

      const slicePageSpy = jest
        .spyOn(PaginationUtils, 'slicePage')
        .mockImplementation(() => {
          return {
            at: jest.fn().mockReturnValue([]),
          };
        });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const messages = await asyncImap['fetchMessages']();

      expect(slicePageSpy).toHaveBeenNthCalledWith(1, sortedUids, {
        size: DEFAULT_PAGINATION_QUERIES.size,
      });

      expect(messages).toEqual([]);

      expect(mockConnection.fetch).not.toHaveBeenCalled();
    });

    it('sortedUids의 정렬과 일치하는 messages를 반환해야 한다', async () => {
      mockMessageMap.initMockMessageMap(shuffle(sortedUids));

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection.fetch.mockImplementation(() => {
        setTimeout(() => {
          fetchMockMessages({
            mockFetch,
            mockMessageMap,
          });
        });

        return mockFetch;
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const messages = await asyncImap['fetchMessages']({
        uids: sortedUids,
      });

      expect(mockConnection.fetch).toHaveBeenCalledTimes(1);

      expect(messages.map((message) => message.attrs.uid)).toEqual(sortedUids);
    });

    it('fetch에서 에러 발생시 해당 에러를 전파해야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const error = new Error('mock fetch error');

      mockConnection.fetch.mockImplementation(() => {
        setTimeout(() => {
          mockFetch.emit('error', error);
        });

        return mockFetch;
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      await expect(
        asyncImap['fetchMessages']({ uids: sortedUids }),
      ).rejects.toEqual(error);
    });

    describe('params ({uids, query, markSeen})', () => {
      it.each`
        uids         | case
        ${[]}        | ${'uids = []'}
        ${undefined} | ${'uids = undefined'}
      `(
        '($case) sort를 호출해야 한다',
        async ({ uids }: { uids: number[] | undefined }) => {
          mockConnection.connect.mockImplementation(() => {
            mockConnection.emit('ready');
          });

          mockConnection.fetch.mockImplementation(() => {
            setTimeout(() => {
              fetchMockMessages({
                mockFetch,
                mockMessageMap,
              });
            });

            return mockFetch;
          });

          const asyncImap = await AsyncImap.connect(
            credential,
            asyncImapConfig,
          );

          const sortSpy = jest
            .spyOn(asyncImap, 'sort' as any)
            .mockResolvedValue(sortedUids);

          await asyncImap['fetchMessages']({ uids });

          expect(sortSpy).toHaveBeenCalledTimes(1);
        },
      );

      it('(query = undefined) DEFAULT_PAGINATION_QUERIES 가 적용되어야 한다', async () => {
        mockConnection.connect.mockImplementation(() => {
          mockConnection.emit('ready');
        });

        mockConnection.fetch.mockImplementation(() => {
          setTimeout(() => {
            fetchMockMessages({
              mockFetch,
              mockMessageMap,
            });
          });

          return mockFetch;
        });

        const pageUids = PaginationUtils.slicePage(sortedUids, {
          size: DEFAULT_PAGINATION_QUERIES.size,
        }).at(DEFAULT_PAGINATION_QUERIES.page);

        const slicePageAt = jest.fn().mockReturnValue(pageUids);

        const slicePageSpy = jest
          .spyOn(PaginationUtils, 'slicePage')
          .mockImplementation(() => {
            return {
              at: slicePageAt,
            };
          });

        const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

        await asyncImap['fetchMessages']({ uids: sortedUids, markSeen: false });

        expect(slicePageAt).toHaveBeenNthCalledWith(
          1,
          DEFAULT_PAGINATION_QUERIES.page,
        );

        expect(slicePageSpy).toHaveBeenNthCalledWith(1, sortedUids, {
          size: DEFAULT_PAGINATION_QUERIES.size,
        });
      });
    });
  });

  describe('sort', () => {
    it('sort 호출 시 connection.sort가 호출되어야 한다', async () => {
      const criteria = {
        sort: ['-ARRIVAL'],
        search: ['SEEN'],
      } as {
        sort: Imap.SortCriteria[];
        search: ImapSearchCriteria.Any[];
      };

      const sortedUids = [4, 3, 2, 1];

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection.sort.mockImplementation(
        (sortCriteria, searchCriteria, callback) => {
          callback(null as unknown as Error, sortedUids);
        },
      );

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const uids = await asyncImap['sort'](criteria.sort, criteria.search);

      expect(uids).toEqual(sortedUids);

      expect(mockConnection.sort).toHaveBeenNthCalledWith(
        1,
        criteria.sort,
        criteria.search,
        expect.any(Function),
      );
    });

    it('connection.sort에서 에러 발생시 해당 에러를 전파해야 한다', async () => {
      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const error = new Error('mock sort error');

      mockConnection.sort.mockImplementation(
        (sortCriteria, searchCriteria, callback) => {
          callback(error, []);
        },
      );

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      await expect(asyncImap['sort'](DEFAULT_CRITERIA.sort)).rejects.toEqual(
        error,
      );
    });
  });

  describe('getMails', () => {
    const mailBox: Imap.MailBox = 'INBOX';

    const sortedUids = [4, 3, 2, 1];

    const mockMessageMap: MockMessageMap = new MockMessageMap();

    let mockFetch: MockFetch;

    beforeEach(() => {
      mockFetch = new MockFetch();

      mockMessageMap.initMockMessageMap(sortedUids);
    });

    afterEach(() => {
      mockFetch.removeAllListeners();

      mockMessageMap.clearMockMessageMap();
    });

    it('메시지 배열이 빈 배열인 경우, fetchMessages를 호출하지 않고 빈 배열을 가지는 페이지네이션 데이터를 반환한다', async () => {
      const emptyUids: number[] = [];

      const selectedBox = createBuilder<Imap.SelectedBox>()
        .flags([
          '\\Seen',
          '\\Flagged',
          '\\Answered',
          '\\Deleted',
          '\\Draft',
        ] as Imap.Flag[])
        .permFlags([])
        .messages({ total: 0, new: 0, unseen: 0 })
        .newKeywords(false)
        .highestmodseq('0')
        .name(mailBox)
        .persistentUIDs(true)
        .readOnly(false)
        .uidnext(0)
        .uidvalidity(0)
        .build();

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const selectBoxSpy = jest
        .spyOn(asyncImap, 'selectBox' as any)
        .mockResolvedValue(selectedBox);
      const sortSpy = jest
        .spyOn(asyncImap, 'sort' as any)
        .mockResolvedValue(emptyUids);
      const fetchMessageSpy = jest.spyOn(asyncImap, 'fetchMessages' as any);

      const { mails, pagination } = await asyncImap.getMails(mailBox);

      const expectedPagination = Pagination.of({ mails: [] }).paginate({
        total: selectedBox.messages.total,
        query: DEFAULT_PAGINATION_QUERIES,
      }).pagination;

      expect(mails).toEqual([]);

      expect(pagination).toEqual(expectedPagination);

      expect(selectBoxSpy).toHaveBeenNthCalledWith(1, mailBox, {
        readOnly: undefined,
      });

      expect(sortSpy).toHaveBeenNthCalledWith(
        1,
        DEFAULT_CRITERIA.sort,
        DEFAULT_CRITERIA.search,
      );

      expect(fetchMessageSpy).not.toHaveBeenCalled();
    });

    it('메시지 배열에서 쿼리 적용시 접근할 수 없는 페이지 범위인 경우, fetchMessages를 호출하지 않고 빈 배열을 가지는 페이지네이션 데이터를 반환한다', async () => {
      const selectedBox = createMockSelectedBox({
        mailBox,
        uids: sortedUids,
      });

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      const selectBoxSpy = jest
        .spyOn(asyncImap, 'selectBox' as any)
        .mockResolvedValue(selectedBox);
      const sortSpy = jest
        .spyOn(asyncImap, 'sort' as any)
        .mockResolvedValue(sortedUids);
      const fetchMessageSpy = jest.spyOn(asyncImap, 'fetchMessages' as any);

      const query: PaginationQuery = {
        page: 2,
        size: DEFAULT_PAGINATION_QUERIES.size,
      };

      const { mails, pagination } = await asyncImap.getMails(mailBox, {
        query,
      });

      const expectedPagination = Pagination.of({ mails: [] }).paginate({
        total: selectedBox.messages.total,
        query,
      }).pagination;

      expect(mails).toEqual([]);
      expect(pagination).toEqual(expectedPagination);

      expect(selectBoxSpy).toHaveBeenNthCalledWith(1, mailBox, {
        readOnly: undefined,
      });

      expect(sortSpy).toHaveBeenNthCalledWith(
        1,
        DEFAULT_CRITERIA.sort,
        DEFAULT_CRITERIA.search,
      );

      expect(fetchMessageSpy).not.toHaveBeenCalled();
    });

    it('메일을 파싱하고 결과를 반환해야 한다', async () => {
      const selectedBox = createMockSelectedBox({
        mailBox,
        uids: sortedUids,
      });

      mockGetStream.mockResolvedValue(Buffer.from('mock buffer'));

      mockSimpleParser.mockResolvedValue({
        from: { value: 'mock@from.com' } as unknown as AddressObject,
        to: [{ value: 'mock@to.com' }] as unknown as AddressObject[],
        subject: 'mockSubject',
        html: '<div>mockHtml</div>',
        attachments: [],
      } as unknown as ParsedMail);

      mockConnection.connect.mockImplementation(() => {
        mockConnection.emit('ready');
      });

      mockConnection.fetch.mockImplementation(() => {
        setTimeout(() => {
          fetchMockMessages({
            mockFetch,
            mockMessageMap,
          });
        });

        return mockFetch;
      });

      const asyncImap = await AsyncImap.connect(credential, asyncImapConfig);

      jest.spyOn(asyncImap, 'selectBox' as any).mockResolvedValue(selectedBox);

      jest.spyOn(asyncImap, 'sort' as any).mockResolvedValue(sortedUids);

      const now = new Date();

      jest.spyOn(asyncImap, 'fetchMessages' as any).mockResolvedValue(
        sortedUids.map<Imap.SequenceMessage>((uid) => {
          return {
            attrs: { uid, date: now },
          } as Imap.SequenceMessage;
        }),
      );

      jest.spyOn(asyncImap, 'closeBox' as any).mockResolvedValue(undefined);

      const { mails, pagination } = await asyncImap.getMails(mailBox);

      const expectedPagination = Pagination.of({ mails }).paginate({
        total: sortedUids.length,
        query: DEFAULT_PAGINATION_QUERIES,
      }).pagination;

      expect(mails.map(({ uid }) => uid)).toEqual(sortedUids);
      expect(pagination).toEqual(expectedPagination);
    });

    describe('autoClose', () => {
      it.each`
        autoClose    | expect
        ${undefined} | ${'메일을 파싱하고 closeBox를 호출해야 한다'}
        ${true}      | ${'메일을 파싱하고 closeBox를 호출해야 한다'}
        ${false}     | ${'메일을 파싱하고 closeBox를 호출하지 않아야 한다'}
      `(
        'autoClose가 $autoClose인 경우, $expect',
        async ({ autoClose }: { autoClose?: boolean }) => {
          const selectedBox = createMockSelectedBox({
            mailBox,
            uids: sortedUids,
          });

          mockGetStream.mockResolvedValue(Buffer.from('mock buffer'));

          mockSimpleParser.mockResolvedValue({
            from: { value: 'mock@from.com' } as unknown as AddressObject,
            to: [{ value: 'mock@to.com' }] as unknown as AddressObject[],
            subject: 'mockSubject',
            html: '<div>mockHtml</div>',
            attachments: [],
          } as unknown as ParsedMail);

          mockConnection.connect.mockImplementation(() => {
            mockConnection.emit('ready');
          });

          mockConnection.fetch.mockImplementation(() => {
            setTimeout(() => {
              fetchMockMessages({
                mockFetch,
                mockMessageMap,
              });
            });

            return mockFetch;
          });

          const asyncImap = await AsyncImap.connect(
            credential,
            asyncImapConfig,
          );

          jest
            .spyOn(asyncImap, 'selectBox' as any)
            .mockResolvedValue(selectedBox);

          jest.spyOn(asyncImap, 'sort' as any).mockResolvedValue(sortedUids);

          const now = new Date();

          jest.spyOn(asyncImap, 'fetchMessages' as any).mockResolvedValue(
            sortedUids.map<Imap.SequenceMessage>((uid) => {
              return {
                attrs: { uid, date: now },
              } as Imap.SequenceMessage;
            }),
          );

          const closeSpy = jest
            .spyOn(asyncImap, 'closeBox' as any)
            .mockResolvedValue(undefined);

          await asyncImap.getMails(mailBox, { autoClose });

          expect(mockGetStream).toHaveBeenCalledTimes(sortedUids.length);
          expect(mockSimpleParser).toHaveBeenCalledTimes(sortedUids.length);

          expect(closeSpy).toHaveBeenCalledTimes(autoClose === false ? 0 : 1);
        },
      );
    });
  });
});
