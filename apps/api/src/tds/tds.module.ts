import { Module } from '@nestjs/common';
import { TdsService } from './tds.service';
import { TdsController } from './tds.controller';

@Module({
  controllers: [TdsController],
  providers: [TdsService],
  exports: [TdsService],
})
export class TdsModule {}