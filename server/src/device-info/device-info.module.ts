import { Module } from '@nestjs/common';
import { DeviceInfoService } from './device-info.service';
import { DeviceInfoController } from './device-info.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DeviceInfoController],
  providers: [DeviceInfoService],
  imports: [PrismaModule],
})
export class DeviceInfoModule {}
