import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService],
  imports: [PrismaModule],
})
export class DevicesModule {}
