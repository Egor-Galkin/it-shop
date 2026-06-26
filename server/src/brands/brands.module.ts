import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService],
  imports: [PrismaModule],
})
export class BrandsModule {}
