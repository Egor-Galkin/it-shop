import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceInfoDto } from './dto/create-device-info.dto';
import { UpdateDeviceInfoDto } from './dto/update-device-info.dto';

@Injectable()
export class DeviceInfoService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceInfoDto: CreateDeviceInfoDto) {
    const device = await this.prisma.device.findUnique({ where: { id: createDeviceInfoDto.deviceId } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${createDeviceInfoDto.deviceId} not found`);
    }

    return this.prisma.deviceInfo.create({
      data: createDeviceInfoDto,
      include: { device: { select: { id: true, name: true } } },
    });
  }

  findAll(deviceId?: number) {
    return this.prisma.deviceInfo.findMany({
      where: deviceId ? { deviceId } : undefined,
      include: { device: { select: { id: true, name: true, img: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const info = await this.prisma.deviceInfo.findUnique({
      where: { id },
      include: { device: { select: { id: true, name: true } } },
    });
    if (!info) throw new NotFoundException(`DeviceInfo with ID ${id} not found`);
    return info;
  }

  async update(id: number, updateDeviceInfoDto: UpdateDeviceInfoDto) {
    await this.findOne(id);
    return this.prisma.deviceInfo.update({
      where: { id },
      data: updateDeviceInfoDto,
      include: { device: { select: { id: true, name: true } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.deviceInfo.delete({ where: { id } });
    return { message: `DeviceInfo block ${id} deleted successfully` };
  }

  async findByDevice(deviceId: number) {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new NotFoundException(`Device with ID ${deviceId} not found`);

    return this.prisma.deviceInfo.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
