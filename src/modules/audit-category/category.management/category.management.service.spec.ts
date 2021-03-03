import { Test, TestingModule } from '@nestjs/testing';
import { CategoryManagementService } from './category.management.service';

describe('Category.ManagementService', () => {
  let service: CategoryManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryManagementService],
    }).compile();

    service = module.get<CategoryManagementService>(CategoryManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
