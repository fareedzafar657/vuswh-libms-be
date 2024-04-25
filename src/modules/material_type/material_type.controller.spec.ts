import { Test, TestingModule } from '@nestjs/testing';
import { MaterialTypeController } from './material_type.controller';
import { MaterialTypeService } from './material_type.service';

describe('MaterialTypeController', () => {
  let controller: MaterialTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialTypeController],
      providers: [MaterialTypeService],
    }).compile();

    controller = module.get<MaterialTypeController>(MaterialTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
