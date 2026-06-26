import { Module } from '@nestjs/common';
import { DeviceImagesService } from './device-images.service';
import { DeviceImagesController } from './device-images.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DeviceImagesController],
  providers: [DeviceImagesService],
  imports: [PrismaModule],
  exports: [DeviceImagesService], // ✅ Экспортируем, если нужно использовать в других сервисах
})
export class DeviceImagesModule {}