import { Test, TestingModule } from '@nestjs/testing';
import { AuditGateway } from './audit.gateway';

describe('AuditGateway', () => {
  let gateway: AuditGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditGateway],
    }).compile();

    gateway = module.get<AuditGateway>(AuditGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
