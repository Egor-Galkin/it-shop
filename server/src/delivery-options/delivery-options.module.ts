import { Module } from '@nestjs/common';
import { DeliveryOptionsService } from './delivery-options.service';
import { DeliveryOptionsController } from './delivery-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DeliveryOptionsController],
  providers: [DeliveryOptionsService],
  imports: [PrismaModule],
  exports: [DeliveryOptionsService],
})
export class DeliveryOptionsModule {}