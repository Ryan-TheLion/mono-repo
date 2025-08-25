import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

class MockMailService {}

describe('MailController', () => {
  let mailController: MailController;

  let mailService: MockMailService;

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
  });

  it('Mail Controller가 존재해야 한다', () => {
    expect(mailController).toBeDefined();

    // TODO: mail 서비스 구현되고 MockMailService 를 테스트에서 활용할 경우 toBeDefined 테스트 제거
    expect(mailService).toBeDefined();
  });
});
