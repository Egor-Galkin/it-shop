import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  imports: [PrismaModule],
  exports: [RatingsService],
})
export class RatingsModule {}
