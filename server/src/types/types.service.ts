import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';

@Injectable()
export class TypesService {
  constructor(private prisma: PrismaService) {}

  create(createTypeDto: CreateTypeDto) {
    return this.prisma.type.create({ data: createTypeDto });
  }

  // ✅ Возвращаем типы с количеством устройств
  async findAll() {
    const types = await this.prisma.type.findMany({
      include: {
        _count: { select: { devices: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    return types.map(t => ({
      ...t,
      deviceCount: t._count.devices
    }));
  }

  async findOne(id: number) {
    const type = await this.prisma.type.findUnique({ where: { id } });
    if (!type) throw new NotFoundException(`Type with ID ${id} not found`);
    return type;
  }

  async update(id: number, updateTypeDto: UpdateTypeDto) {
    await this.findOne(id);
    return this.prisma.type.update({ where: { id }, data: updateTypeDto });
  }

  // ✅ Защита от удаления используемого типа
  async remove(id: number) {
    const deviceCount = await this.prisma.device.count({
      where: { typeId: id }
    });
    
    if (deviceCount > 0) {
      throw new BadRequestException(
        `Cannot delete type: it is used in ${deviceCount} device(s). Please reassign or delete those devices first.`
      );
    }
    
    await this.prisma.type.delete({ where: { id } });
    return { message: `Type with ID ${id} deleted successfully` };
  }
}