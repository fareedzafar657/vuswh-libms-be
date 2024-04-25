import { Test, TestingModule } from '@nestjs/testing';
import { EbooksService } from './ebooks.service';

describe('EbooksService', () => {
  let service: EbooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EbooksService],
    }).compile();

    service = module.get<EbooksService>(EbooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
