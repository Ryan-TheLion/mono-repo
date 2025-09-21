import { Test, TestingModule } from '@nestjs/testing';
import { ContextId, ContextIdFactory, REQUEST } from '@nestjs/core';
import { createBuilder } from 'src/common/utils';
import { Attachment as NodeMailerAttachment } from 'nodemailer/lib/mailer';
import { createTransport, SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { smtpConfig as _smtpConfig, SmtpConfig } from './smtp.config';
import { SmtpService } from './smtp.service';
import { EMAIL_PROTOCOLS_PORT } from '../port';
import { MailCredentialDto, SendMailRequestDto } from '../dto';
import { NodeMailerSendMailResponse } from './types/node-mailer';
import { Request, Response } from 'express';

interface SetupConfig {
  req: Partial<Request>;
  res: Partial<Response>;
  config: SmtpConfig;
}

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn(),
  };
});

class MockTransporter {
  sendMail = jest.fn();
  close = jest.fn();
}

const mockTransporter = new MockTransporter();

(createTransport as jest.Mock).mockReturnValue(mockTransporter);

describe('SMTP Service', () => {
  const defaultConfig: SmtpConfig = {
    host: 'mail.test.com',
    port: EMAIL_PROTOCOLS_PORT.smtp.submission,
  };

  const setup = async (setupConfig: Partial<SetupConfig> = {}) => {
    const res = {
      ...setupConfig?.req?.res,
      ...setupConfig?.res,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: _smtpConfig.KEY,
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
        SmtpService,
      ],
    }).compile();

    return {
      smtpService: await module.resolve(SmtpService, contextId),
      config: module.get<SmtpConfig>(_smtpConfig.KEY),
    };
  };

  let contextId: ContextId;

  const credential: MailCredentialDto = {
    user: 'user@email.com',
    token: 'accessToken',
  };

  beforeEach(() => {
    contextId = ContextIdFactory.create();

    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('SMTP Service가 존재해야 한다', async () => {
    const { smtpService } = await setup();

    expect(smtpService).toBeDefined();
  });

  test('mailer(transporter) 생성시 smtp config, credential 설정이 적용되어야 한다', async () => {
    const smtpConfig = createBuilder<SmtpConfig>()
      .host('smtp.test.com')
      .port(EMAIL_PROTOCOLS_PORT.smtp.submission)
      .build();

    const { smtpService } = await setup({ config: smtpConfig });

    smtpService.getMailer(credential);

    expect(createTransport).toHaveBeenNthCalledWith<[SMTPTransport.Options]>(
      1,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect.objectContaining({
        host: smtpConfig.host,
        port: smtpConfig.port,
        auth: expect.objectContaining({
          user: credential.user,
          pass: credential.token,
        }) as SMTPTransport.Options['auth'],
      } as SMTPTransport.Options),
    );
  });

  test("Express 응답 객체의 'close' 이벤트 발생 시, nodemailer의 transporter가 닫혀야 한다", async () => {
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

    const { smtpService } = await setup({
      req: express.request,
      res: express.response,
    });

    smtpService.getMailer(credential);

    expect(responseSpy).toHaveBeenCalledWith('close', expect.any(Function));

    expect(mockTransporter.close).toHaveBeenCalled();
  });

  describe('sendMail', () => {
    const envelop = {
      from: credential.user,
      to: ['test@site.com', 'testuser@demo.dev'],
    };

    const dto = createBuilder<SendMailRequestDto>()
      .subject('test 이메일 입니다')
      .html('<b>test email</b>')
      .to(envelop.to)
      .build();

    const sendMailSuccessResponse = createBuilder<
      Omit<NodeMailerSendMailResponse, 'pending'>
    >()
      .accepted([])
      .rejected([])
      .ehlo([
        'PIPELINING',
        'SIZE 52428800',
        'ETRN',
        'AUTH PLAIN LOGIN OAUTHBEARER XOAUTH2',
        'AUTH=PLAIN LOGIN OAUTHBEARER XOAUTH2',
        'ENHANCEDSTATUSCODES',
        '8BITMIME',
        'DSN',
        'CHUNKING',
      ])
      .envelopeTime(46)
      .messageTime(116)
      .messageSize(400)
      .response('250 2.0.0 Ok: queued as queue-id')
      .envelope(envelop)
      .messageId('sample-message-id')
      .build() as NodeMailerSendMailResponse;

    it('nodemailer transporter의 sendMail을 호출하고 결과를 반환해야 한다', async () => {
      const { smtpService } = await setup();

      const attachments: NodeMailerAttachment[] = [];

      const sendMailOptions: SendMailOptions = {
        ...dto,
        ...(attachments?.length && { attachments }),
        from: envelop.from,
      };

      mockTransporter.sendMail.mockResolvedValue(sendMailSuccessResponse);

      const res = await smtpService
        .getMailer(credential)
        .sendMail(sendMailOptions);

      expect(mockTransporter.sendMail).toHaveBeenNthCalledWith<
        [SendMailOptions]
      >(1, sendMailOptions);

      expect(res).toEqual(sendMailSuccessResponse);
    });

    it('nodemailer의 transporter에서 Error를 반환할 경우 해당 Error가 발생해야 한다', async () => {
      const { smtpService } = await setup();

      const sendMailOptions: SendMailOptions = {
        ...dto,
        from: envelop.from,
      };

      const error = new Error('smtp error');

      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        smtpService.getMailer(credential).sendMail(sendMailOptions),
      ).rejects.toBe(error);
    });
  });
});
