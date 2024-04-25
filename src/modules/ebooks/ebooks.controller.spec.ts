import { Test, TestingModule } from '@nestjs/testing';
import { EbooksController } from './ebooks.controller';
import { EbooksService } from './ebooks.service';

describe('EbooksController', () => {
  let controller: EbooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbooksController],
      providers: [EbooksService],
    }).compile();

    controller = module.get<EbooksController>(EbooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
