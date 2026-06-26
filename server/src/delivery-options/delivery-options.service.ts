import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryOptionDto } from './dto/create-delivery-option.dto';
import { UpdateDeliveryOptionDto } from './dto/update-delivery-option.dto';

@Injectable()
export class DeliveryOptionsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Проверка уникальности sortOrder
  private async isSortOrderUnique(sortOrder: number, excludeId?: number): Promise<boolean> {
    const where: any = { sortOrder };
    if (excludeId) where.id = { not: excludeId };
    const count = await this.prisma.deliveryOption.count({ where });
    return count === 0;
  }

  // ✅ Проверка: используется ли вариант в заказах
  async isUsedInOrders(id: number): Promise<boolean> {
    const count = await this.prisma.basket.count({ where: { deliveryOptionId: id } });
    return count > 0;
  }

  // ✅ Создание: явно создаём объект data только с разрешёнными полями
  // Это гарантирует, что id (если он пришёл) не попадёт в Prisma
  create(dto: CreateDeliveryOptionDto) {
    const data: any = {};
    
    // Копируем только разрешённые поля
    if (dto.name) data.name = dto.name;
    if (dto.type) data.type = dto.type;
    if (dto.type === 'DELIVERY' && dto.price !== undefined) data.price = dto.price;
    if (dto.type === 'PICKUP' && dto.address) data.address = dto.address;
    if (dto.description) data.description = dto.description;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    
    // ✅ Значения по умолчанию
    if (!data.name && data.type) {
      data.name = data.type === 'DELIVERY' ? 'Доставка' : 'Самовывоз';
    }
    if (data.isActive === undefined) data.isActive = true;
    if (data.sortOrder === undefined) data.sortOrder = 0;
    if (data.type === 'DELIVERY' && data.price === undefined) data.price = null;
    if (data.type === 'PICKUP' && data.address === undefined) data.address = null;
    
    return this.prisma.deliveryOption.create({ data });
  }

  // ✅ Админ-список с сортировкой и _count
  async getAdminList(query: any) {
    const { orderBy = 'sortOrder', orderDir = 'asc' } = query;
    
    const validFields = ['id', 'name', 'type', 'price', 'sortOrder', 'isActive'];
    const orderField = validFields.includes(orderBy) ? orderBy : 'sortOrder';
    
    return this.prisma.deliveryOption.findMany({
      orderBy: { [orderField]: orderDir },
      include: {
        _count: { select: { baskets: true } }
      }
    });
  }

  findAll(activeOnly = true) {
    return this.prisma.deliveryOption.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: number) {
    const option = await this.prisma.deliveryOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException(`DeliveryOption with ID ${id} not found`);
    return option;
  }

  async update(id: number, dto: UpdateDeliveryOptionDto) {
    await this.findOne(id);
    
    const current = await this.prisma.deliveryOption.findUnique({ where: { id } });
    const newType = dto.type || current?.type;
    
    // ✅ Валидация sortOrder
    if (dto.sortOrder !== undefined && !(await this.isSortOrderUnique(dto.sortOrder, id))) {
      throw new ConflictException(`Sort order ${dto.sortOrder} is already used`);
    }
    
    return this.prisma.deliveryOption.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        price: newType === 'DELIVERY' ? dto.price : null,
        address: newType === 'PICKUP' ? dto.address : null,
        description: dto.description,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    // ✅ Проверка: нельзя удалить, если используется в заказах
    if (await this.isUsedInOrders(id)) {
      throw new BadRequestException('Нельзя удалить: вариант используется в заказах');
    }
    
    return this.prisma.deliveryOption.delete({ where: { id } });
  }

  // ✅ Получить доступные варианты для клиента
  async getAvailableForClient() {
    return this.prisma.deliveryOption.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        address: true,
        description: true,
      },
    });
  }

  // ✅ Рассчитать стоимость доставки для корзины
  async calculateDeliveryCost(deliveryOptionId: number | null): Promise<number> {
    if (!deliveryOptionId) return 0;
    
    const option = await this.prisma.deliveryOption.findUnique({
      where: { id: deliveryOptionId },
      select: { type: true, price: true }
    });
    
    if (!option || option.type !== 'DELIVERY' || !option.price) return 0;
    return Number(option.price);
  }
}