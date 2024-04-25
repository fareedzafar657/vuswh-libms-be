import { Test, TestingModule } from '@nestjs/testing';
import { LibraryAssetsController } from './library-assets.controller';
import { LibraryAssetsService } from './library-assets.service';

describe('LibraryAssetsController', () => {
  let controller: LibraryAssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryAssetsController],
      providers: [LibraryAssetsService],
    }).compile();

    controller = module.get<LibraryAssetsController>(LibraryAssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
