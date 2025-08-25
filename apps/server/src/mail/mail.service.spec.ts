import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { SmtpService } from './smtp/smtp.service';
import { Scope } from '@nestjs/common';
import { ImapService } from './imap/imap.service';
import { ContextIdFactory } from '@nestjs/core';

class MockSmtpService {}

class MockImapService {}

describe('MailService', () => {
  let mailService: MailService;

  let smtpService: MockSmtpService;
  let imapService: MockImapService;

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

    imapService = await module.resolve<ImapService, MockImapService>(
      ImapService,
      contextId,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Mail Service가 존재해야 한다', () => {
    expect(mailService).toBeDefined();

    // TODO: smtp 서비스 구현되고 MockSmtpService 를 테스트에서 활용할 경우 toBeDefined 테스트 제거
    expect(smtpService).toBeDefined();
    // TODO: imap 서비스 구현되고 MockImapService 를 테스트에서 활용할 경우 toBeDefined 테스트 제거
    expect(imapService).toBeDefined();
  });
});
