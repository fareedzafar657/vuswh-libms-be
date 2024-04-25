import { Module } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { PublishersController } from './publishers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publisher } from 'src/db/entities/publisher.entity';
import { PUBLISHER_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
  controllers: [PublishersController],
  providers: [
    {
      provide: PUBLISHER_SERVICE,
      useClass: PublishersService,
    },
  ],
  exports: [PUBLISHER_SERVICE],
})
export class PublishersModule {}
