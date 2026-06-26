import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDiscountDto) {
    return this.prisma.discount.create({
      data: {
        deviceId: dto.deviceId,
        value: dto.value,
        dateStart: new Date(dto.dateStart),
        dateEnd: new Date(dto.dateEnd),
      },
    });
  }

  findAll(deviceId?: number) {
    const where = deviceId ? { deviceId } : {};
    return this.prisma.discount.findMany({ where, orderBy: { dateStart: 'desc' } });
  }

  async findOne(id: number) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('Скидка не найдена');
    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dateStart) data.dateStart = new Date(dto.dateStart);
    if (dto.dateEnd) data.dateEnd = new Date(dto.dateEnd);
    
    return this.prisma.discount.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.discount.delete({ where: { id } });
  }

  // ✅ Получить активную скидку для конкретного товара
  async getActiveDiscount(deviceId: number) {
    const now = new Date();
    return this.prisma.discount.findFirst({
      where: {
        deviceId,
        dateStart: { lte: now },
        dateEnd: { gte: now },
      },
    });
  }

  // ✅ Массовое получение активных скидок для списка товаров
  async getActiveDiscountsForDevices(deviceIds: number[]) {
    if (deviceIds.length === 0) return [];
    const now = new Date();
    return this.prisma.discount.findMany({
      where: {
        deviceId: { in: deviceIds },
        dateStart: { lte: now },
        dateEnd: { gte: now },
      },
    });
  }
}