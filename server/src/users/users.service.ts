import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  async create(createUserDto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (exists) throw new ConflictException('User with this email already exists');

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const { id, ...safeData } = createUserDto as any;
    
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role || Role.CLIENT,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 10, search, role = 'CLIENT', orderBy = 'createdAt', orderDir = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = { role };
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    const serverSortableFields = ['id', 'email', 'createdAt'];
    
    let prismaOrderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };
    if (serverSortableFields.includes(orderBy) && orderDir) {
      prismaOrderBy = { [orderBy]: orderDir as Prisma.SortOrder };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              ratings: true,
              baskets: { where: { paidAt: { not: null } } },
            },
          },
        },
        orderBy: prismaOrderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    let sortedUsers = users;
    if (!serverSortableFields.includes(orderBy) && orderDir) {
      const multiplier = orderDir === 'asc' ? 1 : -1;
      sortedUsers = [...users].sort((a: any, b: any) => {
        if (orderBy === 'ratings') {
          return ((a._count?.ratings || 0) - (b._count?.ratings || 0)) * multiplier;
        }
        if (orderBy === 'orders') {
          return ((a._count?.baskets || 0) - (b._count?.baskets || 0)) * multiplier;
        }
        return 0;
      });
    }

    return {
      data: sortedUsers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    
    if (updateUserDto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, NOT: { id } },
      });
      if (exists) throw new ConflictException('User with this email already exists');
    }
    
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.comparePassword(oldPassword, user.password);
    if (!isValid) throw new BadRequestException('Old password is incorrect');

    const hashed = await this.hashPassword(newPassword);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashed },
      select: { id: true, email: true, role: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    const ratingsCount = await this.prisma.rating.count({ where: { userId: id } });
    if (ratingsCount > 0) {
      throw new BadRequestException(`Нельзя удалить: у пользователя есть отзывы (${ratingsCount})`);
    }
    
    const ordersCount = await this.prisma.basket.count({ 
      where: { userId: id, paidAt: { not: null } } 
    });
    if (ordersCount > 0) {
      throw new BadRequestException(`Нельзя удалить: у пользователя есть заказы (${ordersCount})`);
    }
    
    await this.prisma.user.delete({ where: { id } });
    return { message: `User ${id} deleted successfully` };
  }

  async getUserReviews(userId: number) {
    await this.findOne(userId);
    
    return this.prisma.rating.findMany({
      where: { userId },
      include: {
        device: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserOrders(userId: number, limit = 100) {
    await this.findOne(userId);
    
    const baskets = await this.prisma.basket.findMany({
      where: { 
        userId, 
        paidAt: { not: null }
      },
      include: {
        devices: {
          include: {
            device: { 
              select: { 
                id: true, 
                name: true, 
                price: true,
                discounts: {
                  select: { id: true, value: true, dateStart: true, dateEnd: true }
                }
              } 
            },
          },
        },
        deliveryOption: true,
      },
      orderBy: { paidAt: 'desc' },
      take: limit,
    });

    const ordersWithDetails = baskets.map(basket => {
      const paidAt = basket.paidAt!;
      
      const devicesWithDiscount = basket.devices.map(bd => {
        const basePrice = Number(bd.device.price);
        
        const activeDiscount = bd.device.discounts?.find(d => {
          const start = new Date(d.dateStart);
          const end = new Date(d.dateEnd);
          return start <= paidAt && end >= paidAt;
        });
        
        const discountValue = activeDiscount ? Number(activeDiscount.value) : 0;
        const finalPrice = discountValue > 0 
          ? basePrice * (1 - discountValue / 100) 
          : basePrice;
        
        return {
          id: bd.id,
          quantity: bd.quantity,
          device: {
            id: bd.device.id,
            name: bd.device.name,
            basePrice,
            finalPrice: Number(finalPrice.toFixed(2)),
            discount: discountValue > 0 ? discountValue : null,
          },
          lineTotal: Number((finalPrice * bd.quantity).toFixed(2)),
        };
      });
      
      const itemsTotal = devicesWithDiscount.reduce((sum, d) => sum + d.lineTotal, 0);
      const deliveryCost = basket.deliveryOption?.type === 'DELIVERY' && basket.deliveryOption.price
        ? Number(basket.deliveryOption.price)
        : 0;
      
      return {
        ...basket,
        devices: devicesWithDiscount,
        total: Number((itemsTotal + deliveryCost).toFixed(2)),
      };
    });

    return ordersWithDetails;
  }

  async toggleDelivery(basketId: number, deliveredAt: string | null) {
    const basket = await this.prisma.basket.findUnique({
      where: { id: basketId },
      include: { deliveryOption: true },
    });
    
    if (!basket) throw new NotFoundException('Заказ не найден');
    if (!basket.paidAt) throw new BadRequestException('Нельзя изменить статус неоплаченного заказа');
    
    return this.prisma.basket.update({
      where: { id: basketId },
      data: { deliveredAt: deliveredAt ? new Date(deliveredAt) : null },
      include: {
        devices: { include: { device: { select: { name: true, price: true } } } },
        deliveryOption: true,
      },
    });
  }
}