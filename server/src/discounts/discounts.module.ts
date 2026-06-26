import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DiscountsController],
  providers: [DiscountsService],
  imports: [PrismaModule],
  exports: [DiscountsService], // ✅ Экспортируем для использования в DevicesService
})
export class DiscountsModule {}