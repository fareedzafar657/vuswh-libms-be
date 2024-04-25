import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from 'src/db/entities/currency.entity';
import { CURRENCY_SERVICE } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  controllers: [CurrenciesController],
  providers: [
    {
      provide: CURRENCY_SERVICE,
      useClass: CurrenciesService,
    },
  ],
  exports: [CURRENCY_SERVICE],
})
export class CurrenciesModule {}
