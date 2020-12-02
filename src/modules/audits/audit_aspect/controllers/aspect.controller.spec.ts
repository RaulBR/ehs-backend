import { Test, TestingModule } from '@nestjs/testing';
import { AspectController } from './aspect.controller';

describe('Aspect Controller', () => {
  let controller: AspectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AspectController],
    }).compile();

    controller = module.get<AspectController>(AspectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
