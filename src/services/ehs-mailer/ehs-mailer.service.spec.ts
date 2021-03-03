import { Test, TestingModule } from '@nestjs/testing';
import { EhsMailerService } from './ehs-mailer.service';

describe('EhsMailerService', () => {
  let service: EhsMailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EhsMailerService],
    }).compile();

    service = module.get<EhsMailerService>(EhsMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
