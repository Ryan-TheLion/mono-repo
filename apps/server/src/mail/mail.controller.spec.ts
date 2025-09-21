import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { createBuilder } from 'src/common/utils';
import { ProfileResponseDto } from 'src/auth/dto';
import { AppResponseDto, Pagination } from 'src/common/dto';
import {
  GetMailsParam,
  GetMailsQuery,
  GetMailsResponseDto,
  MailCredentialDto,
  MailOauthIntrospectResponseDto,
  SendMailRequestDto,
  SendMailResponseDto,
} from './dto';
import { Imap } from './imap/types';
import { MulterCloudStorageFile } from 'src/multer-cloud-storage/storage/types';
import { NodeMailerSendMailResponse } from './smtp/types/node-mailer';
import { Attachment } from 'nodemailer/lib/mailer';

class MockMailService {
  getMails: jest.MockedFn<MailService['getMails']> = jest.fn();

  sendMail: jest.MockedFn<MailService['sendMail']> = jest.fn();
}

describe('MailController', () => {
  let mailController: MailController;

  let mailService: MockMailService;

  const credential: MailCredentialDto = {
    user: 'user@email.com',
    token: 'testToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useClass: MockMailService,
        },
      ],
    }).compile();

    mailController = module.get<MailController>(MailController);

    mailService = module.get<MockMailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('Mail Controller가 존재해야 한다', () => {
    expect(mailController).toBeDefined();
  });

  describe('GET /boxes/:box > getMailBox', () => {
    it('mailService.getMails를 호출하고 결과를 반환해야 한다', async () => {
      const params = createBuilder<GetMailsParam>().box('INBOX').build();

      const query = createBuilder<GetMailsQuery>().page(1).size(5).build();

      const mails = [] as Imap.ReceivedEmail[];

      const getMailsResponse = Pagination.of({ mails }).paginate({
        total: mails.length,
        query,
      });

      mailService.getMails.mockResolvedValue(getMailsResponse);

      const res = await mailController.getMailBox(params, query, credential);

      expect(res).toEqual(
        AppResponseDto.Successful.ok<GetMailsResponseDto>(getMailsResponse),
      );

      expect(mailService.getMails).toHaveBeenNthCalledWith(
        1,
        params.box,
        credential,
        { query },
      );
    });
  });

  describe('GET /oauth2/introspect > auth', () => {
    it('guard를 통과한 유저의 이메일을 반환해야 한다', () => {
      const profile = createBuilder<ProfileResponseDto>()
        .id('mock-id')
        .user_role('user')
        .email('mock@email.com')
        .phone(null)
        .build();

      const res = mailController.auth(profile);

      expect(res).toEqual(
        AppResponseDto.Successful.ok<MailOauthIntrospectResponseDto>({
          email: profile.email,
        }),
      );
    });
  });

  describe('POST /send > sendMail', () => {
    it('mailService.sendMail을 호출하고 결과를 반환해야 한다', async () => {
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

      const attachments: MulterCloudStorageFile.Uploaded[] = [];

      const mailAttachments = attachments.map<Attachment>((file) => {
        return { filename: file.originalname, path: file.url };
      });

      mailService.sendMail.mockResolvedValue(sendMailResponse);

      const res = await mailController.sendMail(credential, dto, attachments);

      expect(res).toEqual(
        AppResponseDto.Successful.ok<SendMailResponseDto>({
          messageId: sendMailResponse.messageId,
          status: 'success',
          accepted: sendMailResponse.accepted,
          rejected: sendMailResponse.rejected,
        }),
      );

      expect(mailService.sendMail).toHaveBeenNthCalledWith(
        1,
        credential,
        dto,
        mailAttachments,
      );
    });
  });
});
