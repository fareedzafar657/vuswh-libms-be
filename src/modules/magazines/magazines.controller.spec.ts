import { Test, TestingModule } from '@nestjs/testing';
import { MagazinesController } from './magazines.controller';
import { MagazinesService } from './magazines.service';

describe('MagazinesController', () => {
  let controller: MagazinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MagazinesController],
      providers: [MagazinesService],
    }).compile();

    controller = module.get<MagazinesController>(MagazinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
