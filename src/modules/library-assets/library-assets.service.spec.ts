import { Test, TestingModule } from '@nestjs/testing';
import { LibraryAssetsService } from './library-assets.service';

describe('LibraryAssetsService', () => {
  let service: LibraryAssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibraryAssetsService],
    }).compile();

    service = module.get<LibraryAssetsService>(LibraryAssetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
