import { Test, TestingModule } from '@nestjs/testing';
import { ContextId, ContextIdFactory, REQUEST } from '@nestjs/core';
import { createBuilder, PaginationUtils } from 'src/common/utils';
import { EMAIL_PROTOCOLS_PORT } from '../port';
import { MailCredentialDto } from '../dto';
import { Request, Response } from 'express';
import { imapConfig as _imapConfig, ImapConfig } from './imap.config';
import { ImapService } from './imap.service';
import { GetMailsOption, Imap, ImapServiceMethods } from './types';
import { AsyncImap } from './async';

interface SetupConfig {
  req: Partial<Request>;
  res: Partial<Response>;
  config: ImapConfig;
}

jest.mock('./async');

const MockAsyncImap = jest.mocked(AsyncImap);

const mockAsyncImap = {
  getMails: jest.fn(),
  closeConnection: jest.fn(),
};

describe('IMAP Service', () => {
  let contextId: ContextId;

  const defaultConfig: ImapConfig = {
    host: 'imap.test.com',
    port: EMAIL_PROTOCOLS_PORT.imap.standard,
  };

  const credential: MailCredentialDto = {
    user: 'user@email.com',
    token: 'accessToken',
  };

  const setup = async (setupConfig: Partial<SetupConfig> = {}) => {
    const res = {
      ...setupConfig?.req?.res,
      ...setupConfig?.res,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: _imapConfig.KEY,
          useFactory() {
            return setupConfig?.config ?? defaultConfig;
          },
        },
        {
          provide: REQUEST,
          useValue: {
            ...setupConfig?.req,
            res: {
              headersSent: false,
              ...res,
              ...(!res?.on && { on: jest.fn() }),
            },
          },
        },
        ImapService,
      ],
    }).compile();

    return {
      imapService: await module.resolve(ImapService, contextId),
      config: module.get<ImapConfig>(_imapConfig.KEY),
    };
  };

  beforeEach(() => {
    contextId = ContextIdFactory.create();

    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    MockAsyncImap.connect.mockResolvedValue(
      mockAsyncImap as unknown as AsyncImap,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('Imap Service가 존재해야 한다', async () => {
    const { imapService } = await setup();

    expect(imapService).toBeDefined();
  });

  describe('getImapClient', () => {
    it('설정한 credential과 config로 AsyncImap의 connect를 호출해야 한다', async () => {
      const imapConfig = createBuilder<ImapConfig>()
        .host('imap.mail.com')
        .port(EMAIL_PROTOCOLS_PORT.imap.standard)
        .build();

      const { imapService } = await setup({ config: imapConfig });

      await imapService.getImapClient(credential);

      expect(MockAsyncImap.connect).toHaveBeenNthCalledWith<
        Parameters<typeof AsyncImap.connect>
      >(1, credential, imapConfig);
    });

    it('AsyncImap의 connect에서 에러가 발생할 경우 해당 에러를 반환해야 한다', async () => {
      const { imapService } = await setup();

      const error = new Error('mock async imap connection error');

      MockAsyncImap.connect.mockRejectedValue(error);

      await expect(imapService.getImapClient(credential)).rejects.toEqual(
        error,
      );
    });

    it("Express 응답 객체의 'close' 이벤트 발생 시, AsyncImap의 closeConnection을 호출해야 한다", async () => {
      /**
       * 'close' 이벤트 시뮬레이션을 위해 jest.doMock으로 express 모듈을 재정의하고,
       * spyOn으로 'on' 메서드의 동작을 조작
       */

      jest.doMock('express', () => {
        const { response } =
          jest.requireActual<typeof import('express')>('express');

        return {
          request: jest.fn(),
          response,
        };
      });

      const express = await import('express');

      const responseSpy = jest
        .spyOn(express.response, 'on')
        .mockImplementation((event, listener) => {
          if (event === 'close') {
            listener();

            return express.response;
          }

          return express.response;
        });

      const { imapService } = await setup({
        req: express.request,
        res: express.response,
      });

      await imapService.getImapClient(credential);

      expect(responseSpy).toHaveBeenCalledWith('close', expect.any(Function));

      expect(mockAsyncImap.closeConnection).toHaveBeenCalled();
    });
  });

  describe('getMails', () => {
    const mailBox: Imap.MailBox = 'INBOX';

    const getMailsOption = createBuilder<GetMailsOption>()
      .query({ page: 1, size: 5 })
      .criteria({ search: ['UNSEEN'], sort: ['-ARRIVAL'] })
      .build();

    const mails = [] as Imap.ReceivedEmail[];

    it('설정한 옵션으로 AsyncImap의 getMails를 호출하고 결과를 반환해야 한다', async () => {
      const { imapService } = await setup();

      const mockResponse = createBuilder<
        Awaited<ReturnType<ImapServiceMethods['getMails']>>
      >()
        .mails(mails)
        .pagination(
          PaginationUtils.createPagination({
            total: mails.length,
            query: getMailsOption.query,
          }),
        )
        .build();

      mockAsyncImap.getMails.mockResolvedValue(mockResponse);

      const client = await imapService.getImapClient(credential);

      const res = await client.getMails(mailBox, getMailsOption);

      expect(mockAsyncImap.getMails).toHaveBeenNthCalledWith<
        Parameters<AsyncImap['getMails']>
      >(1, mailBox, {
        query: getMailsOption.query,
        criteria: { ...getMailsOption.criteria },
      });

      expect(res).toEqual(mockResponse);
    });

    it('AsyncImap의 getMails에서 에러가 발생할 경우 해당 에러를 반환해야 한다', async () => {
      const { imapService } = await setup();

      const error = new Error('mock getMails error');

      mockAsyncImap.getMails.mockRejectedValue(error);

      const client = await imapService.getImapClient(credential);

      await expect(client.getMails(mailBox, getMailsOption)).rejects.toEqual(
        error,
      );
    });
  });
});
