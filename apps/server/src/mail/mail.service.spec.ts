import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { SmtpService } from './smtp/smtp.service';
import { Scope } from '@nestjs/common';
import { ImapService } from './imap/imap.service';
import { ContextIdFactory } from '@nestjs/core';
import { SmtpServiceMethods } from './smtp/types';
import { GetMailsOption, Imap, ImapServiceMethods } from './imap/types';
import { createBuilder } from 'src/common/utils';
import { NodeMailerSendMailResponse } from './smtp/types/node-mailer';
import { MailCredentialDto, SendMailRequestDto } from './dto';
import { Attachment } from 'nodemailer/lib/mailer';
import { SendMailOptions } from 'nodemailer';
import { Pagination } from 'src/common/dto';

type MockSmtpServiceMethods = jest.Mocked<SmtpServiceMethods>;

type MockImapServiceMethods = jest.Mocked<ImapServiceMethods>;

class MockSmtpService {
  getMailer: jest.MockedFn<SmtpService['getMailer']> = jest.fn();
}

const mockSmtpServiceMethods: MockSmtpServiceMethods = {
  sendMail: jest.fn(),
};

class MockImapService {
  getImapClient: jest.MockedFn<ImapService['getImapClient']> = jest.fn();
}

const mockImapServiceMethods: MockImapServiceMethods = {
  getMails: jest.fn(),
};

describe('MailService', () => {
  let mailService: MailService;

  let smtpService: MockSmtpService;
  let imapService: MockImapService;

  const credential: MailCredentialDto = {
    user: 'user@email.com',
    token: 'accessToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          scope: Scope.REQUEST,
          provide: SmtpService,
          useClass: MockSmtpService,
        },
        {
          scope: Scope.REQUEST,
          provide: ImapService,
          useClass: MockImapService,
        },
      ],
    }).compile();

    const contextId = ContextIdFactory.create();

    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    mailService = await module.resolve(MailService, contextId);

    smtpService = await module.resolve<SmtpService, MockSmtpService>(
      SmtpService,
      contextId,
    );

    smtpService.getMailer.mockReturnValue(mockSmtpServiceMethods);

    imapService = await module.resolve<ImapService, MockImapService>(
      ImapService,
      contextId,
    );

    imapService.getImapClient.mockResolvedValue(mockImapServiceMethods);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('Mail Service가 존재해야 한다', () => {
    expect(mailService).toBeDefined();
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

    const sendMailResponse = createBuilder<
      Omit<NodeMailerSendMailResponse, 'pending'>
    >()
      .accepted(envelop.to)
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

    it('smtpService의 sendMail을 호출하고 결과를 반환해야 한다', async () => {
      const attachments = [] as Attachment[];

      mockSmtpServiceMethods.sendMail.mockResolvedValue(sendMailResponse);

      const res = await mailService.sendMail(credential, dto, attachments);

      expect(res).toEqual(sendMailResponse);

      expect(smtpService.getMailer).toHaveBeenNthCalledWith(1, credential);

      expect(mockSmtpServiceMethods.sendMail).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          ...dto,
          ...(attachments.length && { attachments }),
        } as SendMailOptions),
      );
    });
  });

  describe('getMails', () => {
    it('imapService의 getMails를 호출하고 결과를 반환해야 한다', async () => {
      const mailBox: Imap.MailBox = 'INBOX';

      const getMailsOption = createBuilder<GetMailsOption>()
        .query({ page: 1, size: 5 })
        .criteria({
          search: ['SEEN'],
          sort: ['-ARRIVAL'],
        })
        .markSeen(false)
        .build();

      const receivedEmails = [
        {
          uid: 1,
          from: { address: 'mock@from.com' },
          to: [{ address: credential.user }],
        },
      ] as Imap.ReceivedEmail[];

      const getMailsResponse = Pagination.of({
        mails: receivedEmails,
      }).paginate({
        total: receivedEmails.length,
        query: getMailsOption.query,
      });

      mockImapServiceMethods.getMails.mockResolvedValue(getMailsResponse);

      const res = await mailService.getMails(
        mailBox,
        credential,
        getMailsOption,
      );

      expect(res).toEqual(getMailsResponse);

      expect(imapService.getImapClient).toHaveBeenNthCalledWith(1, credential);

      expect(mockImapServiceMethods.getMails).toHaveBeenNthCalledWith(
        1,
        mailBox,
        getMailsOption,
      );
    });
  });
});
