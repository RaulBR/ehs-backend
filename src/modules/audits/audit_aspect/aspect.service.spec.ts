import { Test, TestingModule } from '@nestjs/testing';
import { AspectService } from './aspect.service';

describe('AspectService', () => {
  let service: AspectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AspectService],
    }).compile();

    service = module.get<AspectService>(AspectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
