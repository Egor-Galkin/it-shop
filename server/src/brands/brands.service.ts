import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({ data: createBrandDto })
  }

  // ✅ Возвращаем бренды с количеством устройств
  async findAll() {
    const brands = await this.prisma.brand.findMany({
      include: {
        _count: { select: { devices: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    return brands.map(b => ({
      ...b,
      deviceCount: b._count.devices
    }));
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: updateBrandDto });
  }

  // ✅ Защита от удаления используемого бренда
  async remove(id: number) {
    const deviceCount = await this.prisma.device.count({
      where: { brandId: id }
    });
    
    if (deviceCount > 0) {
      throw new BadRequestException(
        `Cannot delete brand: it is used in ${deviceCount} device(s). Please reassign or delete those devices first.`
      );
    }
    
    await this.prisma.brand.delete({ where: { id } });
    return { message: `Brand with ID ${id} deleted successfully` };
  }
}
