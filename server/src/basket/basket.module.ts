import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [BasketController],
  providers: [BasketService],
  imports: [PrismaModule],
  exports: [BasketService],
})
export class BasketModule {}
