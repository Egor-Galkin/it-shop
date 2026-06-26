import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceImageDto } from './dto/create-device-image.dto';
import { UpdateDeviceImageDto } from './dto/update-device-image.dto';

@Injectable()
export class DeviceImagesService {
  constructor(private prisma: PrismaService) {}

  create(createDeviceImageDto: CreateDeviceImageDto) {
    return this.prisma.deviceImage.create({
      data: createDeviceImageDto,
    });
  }

  findAll(deviceId?: number) {
    const where = deviceId ? { deviceId } : {};
    return this.prisma.deviceImage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const image = await this.prisma.deviceImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException(`DeviceImage with ID ${id} not found`);
    return image;
  }

  async update(id: number, updateDeviceImageDto: UpdateDeviceImageDto) {
    await this.findOne(id);
    return this.prisma.deviceImage.update({
      where: { id },
      data: updateDeviceImageDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.deviceImage.delete({ where: { id } });
  }

  // ✅ Удалить все изображения устройства (полезно при обновлении)
  async deleteByDeviceId(deviceId: number) {
    return this.prisma.deviceImage.deleteMany({ where: { deviceId } });
  }
}