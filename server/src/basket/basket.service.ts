import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class BasketService {
  constructor(private prisma: PrismaService) {}

  private parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async getOrCreateActive(userId: number) {
    let basket = await this.prisma.basket.findFirst({
      where: { userId, paidAt: null },
      include: {
        devices: {
          include: {
            device: {
              select: {
                id: true,
                name: true,
                price: true,
                img: true,
                type: { select: { name: true } },
                brand: { select: { name: true } }
              }
            }
          }
        },
        deliveryOption: true
      }
    });

    if (!basket) {
      basket = await this.prisma.basket.create({
        data: { userId, paidAt: null },
        include: { 
          devices: { 
            include: { 
              device: { 
                select: { 
                  id: true, 
                  name: true, 
                  price: true,
                  img: true,
                  type: { select: { name: true } },
                  brand: { select: { name: true } }
                } 
              } 
            } 
          },
          deliveryOption: true
        }
      });
    }

    // ✅ Рассчитываем calculatedPrice для каждого товара
    const now = new Date();
    const devicesWithPrices = await Promise.all(
      basket.devices.map(async (bd) => {
        const activeDiscount = await this.prisma.discount.findFirst({
          where: {
            deviceId: bd.deviceId,
            dateStart: { lte: now },
            dateEnd: { gte: now },
          },
        });

        const basePrice = Number(bd.device.price);
        const discountValue = activeDiscount ? Number(activeDiscount.value) : 0;
        const calculatedPrice = discountValue > 0 
          ? Number((basePrice * (1 - discountValue / 100)).toFixed(2)) 
          : basePrice;

        return { ...bd, calculatedPrice };
      })
    );

    // ✅ Явно возвращаем deliveryOptionId на верхнем уровне
    return { 
      ...basket, 
      deliveryOptionId: basket.deliveryOptionId, // ✅ Это ключевое исправление!
      devices: devicesWithPrices 
    };
  }

  async addItem(userId: number, addItemDto: AddItemDto) {
    const basket = await this.getOrCreateActive(userId);
    
    const device = await this.prisma.device.findUnique({ where: { id: addItemDto.deviceId } });
    if (!device) throw new NotFoundException(`Device with ID ${addItemDto.deviceId} not found`);

    const now = new Date();
    const activeDiscount = await this.prisma.discount.findFirst({
      where: {
        deviceId: addItemDto.deviceId,
        dateStart: { lte: now },
        dateEnd: { gte: now },
      },
    });

    const basePrice = Number(device.price);
    const discountValue = activeDiscount ? Number(activeDiscount.value) : 0;
    const calculatedPrice = discountValue > 0 
      ? Number((basePrice * (1 - discountValue / 100)).toFixed(2)) 
      : basePrice;

    const basketDevice = await this.prisma.basketDevice.upsert({
      where: {
        basketId_deviceId: {
          basketId: basket.id,
          deviceId: addItemDto.deviceId
        }
      },
      update: {
        quantity: { increment: addItemDto.quantity || 1 }
      },
      create: {
        basketId: basket.id,
        deviceId: addItemDto.deviceId,
        quantity: addItemDto.quantity || 1
      },
      include: {
        device: { 
          select: { 
            id: true, 
            name: true, 
            price: true, 
            img: true,
            type: { select: { name: true } },
            brand: { select: { name: true } }
          } 
        }
      }
    });

    return { ...basketDevice, calculatedPrice };
  }

  async updateItem(userId: number, basketDeviceId: number, updateItemDto: UpdateItemDto) {
    const item = await this.prisma.basketDevice.findUnique({
      where: { id: basketDeviceId },
      include: { basket: true }
    });
    
    if (!item) throw new NotFoundException('Item not found in basket');
    if (item.basket.userId !== userId) {
      throw new ForbiddenException('You can only modify your own basket');
    }
    if (item.basket.paidAt !== null) {
      throw new BadRequestException('Cannot modify a paid order');
    }

    return this.prisma.basketDevice.update({
      where: { id: basketDeviceId },
      data: { quantity: updateItemDto.quantity },
      include: { 
        device: { 
          select: { 
            id: true, 
            name: true, 
            price: true,
            type: { select: { name: true } },
            brand: { select: { name: true } }
          } 
        } 
      }
    });
  }

  async removeItem(userId: number, basketDeviceId: number) {
    const item = await this.prisma.basketDevice.findUnique({
      where: { id: basketDeviceId },
      include: { basket: true }
    });
    
    if (!item) throw new NotFoundException('Item not found');
    if (item.basket.userId !== userId) {
      throw new ForbiddenException('You can only modify your own basket');
    }
    if (item.basket.paidAt !== null) {
      throw new BadRequestException('Cannot modify a paid order');
    }

    await this.prisma.basketDevice.delete({ where: { id: basketDeviceId } });
    return { message: 'Item removed from basket' };
  }

  async clear(userId: number) {
    const basket = await this.getOrCreateActive(userId);
    
    if (basket.paidAt !== null) {
      throw new BadRequestException('Cannot clear a paid order');
    }

    await this.prisma.basketDevice.deleteMany({ where: { basketId: basket.id } });
    return { message: 'Basket cleared' };
  }

  // ✅ Установить способ получения — с явным возвратом deliveryOptionId
  async setDeliveryOption(userId: number, deliveryOptionId: number | null) {
    const basket = await this.getOrCreateActive(userId);
    
    if (basket.paidAt !== null) {
      throw new BadRequestException('Cannot modify a paid order');
    }

    if (deliveryOptionId) {
      const option = await this.prisma.deliveryOption.findUnique({
        where: { id: deliveryOptionId, isActive: true }
      });
      if (!option) {
        throw new NotFoundException('Способ доставки не найден или неактивен');
      }
    }

    const updated = await this.prisma.basket.update({
      where: { id: basket.id },
      data: { deliveryOptionId },
      include: {
        devices: {
          include: {
            device: {
              select: {
                id: true,
                name: true,
                price: true,
                img: true,
                type: { select: { name: true } },
                brand: { select: { name: true } }
              }
            }
          }
        },
        deliveryOption: true
      }
    });

    // ✅ Явно возвращаем deliveryOptionId
    return { 
      ...updated, 
      deliveryOptionId: updated.deliveryOptionId 
    };
  }

  async calculateBasketTotal(basketId: number): Promise<number> {
    const basket = await this.prisma.basket.findUnique({
      where: { id: basketId },
      include: {
        devices: { include: { device: true } },
        deliveryOption: true
      }
    });
    
    if (!basket) return 0;
    
    const now = new Date();
    let itemsTotal = 0;
    
    for (const item of basket.devices) {
      const device = await this.prisma.device.findUnique({
        where: { id: item.deviceId },
        include: { discounts: true }
      });
      
      if (!device) continue;
      
      const basePrice = Number(device.price);
      const activeDiscount = device.discounts?.find(d => 
        new Date(d.dateStart) <= now && new Date(d.dateEnd) >= now
      );
      
      const discountValue = activeDiscount ? Number(activeDiscount.value) : 0;
      const finalPrice = discountValue > 0 
        ? basePrice * (1 - discountValue / 100) 
        : basePrice;
      
      itemsTotal += finalPrice * item.quantity;
    }
    
    let deliveryCost = 0;
    if (basket.deliveryOption?.type === 'DELIVERY' && basket.deliveryOption.price) {
      deliveryCost = Number(basket.deliveryOption.price);
    }
    
    return Number((itemsTotal + deliveryCost).toFixed(2));
  }

  async checkout(userId: number) {
    const basket = await this.getOrCreateActive(userId);
    
    if (basket.paidAt !== null) {
      throw new BadRequestException('This order is already paid');
    }
    
    const items = await this.prisma.basketDevice.findMany({
      where: { basketId: basket.id },
      include: { device: true }
    });
    
    if (items.length === 0) {
      throw new BadRequestException('Cannot pay for an empty basket');
    }

    const now = new Date();
    
    let itemsTotal = 0;
    for (const item of items) {
      const device = await this.prisma.device.findUnique({ 
        where: { id: item.deviceId },
        include: { discounts: true }
      });
      
      if (!device) continue;
      
      const basePrice = Number(device.price);
      const activeDiscount = device.discounts?.find(d => 
        new Date(d.dateStart) <= now && new Date(d.dateEnd) >= now
      );
      
      const discountValue = activeDiscount ? Number(activeDiscount.value) : 0;
      const finalPrice = discountValue > 0 
        ? basePrice * (1 - discountValue / 100) 
        : basePrice;
      
      itemsTotal += finalPrice * item.quantity;
    }
    
    let deliveryCost = 0;
    if (basket.deliveryOption?.type === 'DELIVERY' && basket.deliveryOption.price) {
      deliveryCost = Number(basket.deliveryOption.price);
    }
    
    const total = itemsTotal + deliveryCost;

    const paidBasket = await this.prisma.basket.update({
      where: { id: basket.id },
      data: { 
        paidAt: new Date(),
        deliveredAt: null
      },
      include: {
        devices: {
          include: {
            device: { 
              select: { 
                id: true, 
                name: true, 
                price: true, 
                img: true,
                type: { select: { name: true } },
                brand: { select: { name: true } }
              } 
            }
          }
        },
        deliveryOption: true
      }
    });

    // ✅ Возвращаем deliveryOptionId для истории
    return { 
      ...paidBasket, 
      deliveryOptionId: paidBasket.deliveryOptionId,
      total: Number(total.toFixed(2)) 
    };
  }

  async getOrderHistory(userId: number, limit = 10) {
    const orders = await this.prisma.basket.findMany({
      where: { userId, paidAt: { not: null } },
      include: {
        devices: {
          include: {
            device: {
              select: {
                id: true,
                name: true,
                price: true,
                img: true,
                type: { select: { name: true } },
                brand: { select: { name: true } },
                discounts: {
                  select: { id: true, value: true, dateStart: true, dateEnd: true }
                }
              }
            }
          }
        },
        deliveryOption: true
      },
      orderBy: { paidAt: 'desc' },
      take: limit
    });

    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const paidAt = order.paidAt!;
      
      const itemsWithPrices = await Promise.all(order.devices.map(async (item) => {
        const device = item.device;
        const basePrice = Number(device.price);
        
        const activeDiscount = device.discounts?.find(d => 
          new Date(d.dateStart) <= paidAt && new Date(d.dateEnd) >= paidAt
        );
        
        const discountValue = activeDiscount ? Number(activeDiscount.value) : 0;
        const finalPrice = discountValue > 0 
          ? basePrice * (1 - discountValue / 100) 
          : basePrice;
        
        return {
          ...item,
          device: {
            ...device,
            discounts: undefined
          },
          unitPrice: basePrice,
          paidPrice: Number(finalPrice.toFixed(2)),
          discountApplied: activeDiscount ? {
            id: activeDiscount.id,
            value: discountValue
          } : null
        };
      }));
      
      let itemsTotal = itemsWithPrices.reduce((sum, i) => sum + i.paidPrice * i.quantity, 0);
      let deliveryCost = 0;
      
      if (order.deliveryOption?.type === 'DELIVERY' && order.deliveryOption.price) {
        deliveryCost = Number(order.deliveryOption.price);
      }
      
      const total = itemsTotal + deliveryCost;
      
      return {
        ...order,
        deliveryOptionId: order.deliveryOptionId, // ✅ Явно возвращаем ID
        devices: itemsWithPrices,
        total: Number(total.toFixed(2)),
        deliveryStatus: order.deliveryOption?.type === 'PICKUP' 
          ? (order.deliveredAt ? 'picked_up' : 'ready_for_pickup')
          : (order.deliveredAt ? 'delivered' : 'in_transit')
      };
    }));

    return enrichedOrders;
  }

  async cancelOrder(userId: number, basketId: number) {
    const basket = await this.prisma.basket.findUnique({
      where: { id: basketId, userId },
    });
    
    if (!basket) throw new NotFoundException('Order not found');
    if (basket.paidAt === null) {
      throw new BadRequestException('Cannot cancel an unpaid order');
    }

    await this.prisma.basket.delete({ where: { id: basketId } });
    return { message: 'Order cancelled' };
  }

  async markAsDelivered(basketId: number) {
    const basket = await this.prisma.basket.findUnique({
      where: { id: basketId },
      include: { deliveryOption: true }
    });
    
    if (!basket) throw new NotFoundException('Order not found');
    if (basket.paidAt === null) {
      throw new BadRequestException('Cannot mark an unpaid order as delivered');
    }
    if (basket.deliveredAt) {
      throw new BadRequestException('Order already marked as delivered');
    }

    const updated = await this.prisma.basket.update({
      where: { id: basketId },
      data: { deliveredAt: new Date() },
      include: { deliveryOption: true }
    });

    return { 
      ...updated, 
      deliveryOptionId: updated.deliveryOptionId // ✅ Возвращаем ID
    };
  }

  create(createBasketDto: CreateBasketDto) {
    return 'This action adds a new basket';
  }

  async findAll(query: { userId?: number; paid?: boolean; limit?: number }) {
    const where: any = {};
    
    if (query.userId) where.userId = query.userId;
    if (query.paid !== undefined) {
      where.paidAt = query.paid ? { not: null } : null;
    }

    return this.prisma.basket.findMany({
      where,
      include: {
        user: { select: { id: true, email: true } },
        devices: {
          include: {
            device: { select: { id: true, name: true, price: true } }
          }
        },
        deliveryOption: true
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 20
    }).then(baskets => 
      // ✅ Маппим, чтобы добавить deliveryOptionId на верхний уровень
      baskets.map(b => ({ ...b, deliveryOptionId: b.deliveryOptionId }))
    );
  }

  async findOneById(id: number) {
    const basket = await this.prisma.basket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        devices: {
          include: {
            device: { select: { id: true, name: true, price: true, img: true } }
          }
        },
        deliveryOption: true
      }
    });
    if (!basket) throw new NotFoundException(`Basket with ID ${id} not found`);
    
    // ✅ Возвращаем с deliveryOptionId
    return { ...basket, deliveryOptionId: basket.deliveryOptionId };
  }

  findOne(id: number) {
    return `This action returns a #${id} basket`;
  }

  update(id: number, updateBasketDto: UpdateBasketDto) {
    return `This action updates a #${id} basket`;
  }

  remove(id: number) {
    return `This action removes a #${id} basket`;
  }

  async getDashboardStats() {
    const [totalUsers, newUsersWeek, totalOrders, revenue, popularDevices] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      
      this.prisma.user.count({
        where: {
          role: 'CLIENT',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      
      this.prisma.basket.count({ where: { paidAt: { not: null } } }),
      
      this.prisma.basket.findMany({
        where: { paidAt: { not: null } },
        include: {
          devices: {
            include: {
              device: {
                select: {
                  price: true,
                  discounts: { 
                    select: { dateStart: true, dateEnd: true, value: true } 
                  }
                }
              }
            }
          },
          deliveryOption: true
        }
      }).then(baskets => {
        let totalRevenue = 0;
        for (const basket of baskets) {
          const paidAt = basket.paidAt!;
          
          for (const bd of basket.devices) {
            const basePrice = Number(bd.device.price);
            const activeDiscount = bd.device.discounts?.find(d => 
              new Date(d.dateStart) <= paidAt && new Date(d.dateEnd) >= paidAt
            );
            const discountVal = activeDiscount ? Number(activeDiscount.value) : 0;
            const finalPrice = discountVal > 0 
              ? basePrice * (1 - discountVal / 100) 
              : basePrice;
            totalRevenue += finalPrice * bd.quantity;
          }
          
          if (basket.deliveryOption?.type === 'DELIVERY' && basket.deliveryOption.price) {
            totalRevenue += Number(basket.deliveryOption.price);
          }
        }
        return totalRevenue;
      }),
      
      this.prisma.basketDevice.groupBy({
        by: ['deviceId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }).then(async groups => {
        const devices = await this.prisma.device.findMany({
          where: { id: { in: groups.map(g => g.deviceId) } },
          select: { id: true, name: true, price: true }
        });
        return groups.map(g => {
          const device = devices.find(d => d.id === g.deviceId);
          return {
            name: device?.name || 'Unknown',
            quantity: g._sum.quantity || 0,
            revenue: (g._sum.quantity || 0) * Number(device?.price || 0)
          };
        });
      })
    ]);

    return {
      totalUsers,
      newUsersWeek,
      totalOrders,
      revenue: Math.round(revenue),
      popularDevices
    };
  }

  async getStatsByType() {
    return this.prisma.device.groupBy({
      by: ['typeId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }).then(async groups => {
      const types = await this.prisma.type.findMany({
        where: { id: { in: groups.map(g => g.typeId) } },
        select: { id: true, name: true }
      });
      return groups.map(g => ({
        label: types.find(t => t.id === g.typeId)?.name || 'Unknown',
        value: g._count.id
      }));
    });
  }

  async getStatsByBrand() {
    return this.prisma.device.groupBy({
      by: ['brandId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }).then(async groups => {
      const brands = await this.prisma.brand.findMany({
        where: { id: { in: groups.map(g => g.brandId) } },
        select: { id: true, name: true }
      });
      return groups.map(g => ({
        label: brands.find(b => b.id === g.brandId)?.name || 'Unknown',
        value: g._count.id
      }));
    });
  }

  async getOrderTrend(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.prisma.basket.findMany({
      where: { paidAt: { not: null, gte: startDate } },
      select: { 
        paidAt: true, 
        devices: { include: { device: { select: { price: true } } } },
        deliveryOption: { select: { type: true, price: true } }
      }
    }).then(baskets => {
      const byDay: Record<string, { orders: number; revenue: number }> = {};
      baskets.forEach(b => {
        const day = new Date(b.paidAt!).toISOString().split('T')[0];
        if (!byDay[day]) byDay[day] = { orders: 0, revenue: 0 };
        
        byDay[day].orders += 1;
        
        let dayRevenue = b.devices.reduce((s, d) => 
          s + Number(d.device.price) * d.quantity, 0);
        
        if (b.deliveryOption?.type === 'DELIVERY' && b.deliveryOption.price) {
          dayRevenue += Number(b.deliveryOption.price);
        }
        
        byDay[day].revenue += dayRevenue;
      });
      return Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));
    });
  }

  async getUsersByPurchases(startDateStr?: string, endDateStr?: string) {
    const where: any = { user: { role: 'CLIENT' } };
    
    if (startDateStr && endDateStr) {
      const startDate = this.parseDate(startDateStr);
      const endDate = this.parseDate(endDateStr);
      endDate.setHours(23, 59, 59, 999);
      where.paidAt = { not: null, gte: startDate, lte: endDate };
    } else {
      where.paidAt = { not: null };
    }

    const baskets = await this.prisma.basket.findMany({
      where,
      include: { user: true, devices: true }
    });

    const userStats: Record<number, number> = {};
    baskets.forEach(b => {
      const userId = b.userId;
      if (!userStats[userId]) userStats[userId] = 0;
      userStats[userId] += b.devices.reduce((sum, d) => sum + d.quantity, 0);
    });

    const ranges = [
      { label: 'Менее 5', min: 0, max: 4, count: 0 },
      { label: '5–10', min: 5, max: 10, count: 0 },
      { label: '11–25', min: 11, max: 25, count: 0 },
      { label: 'Более 25', min: 26, max: Infinity, count: 0 },
    ];

    Object.values(userStats).forEach(count => {
      const range = ranges.find(r => count >= r.min && count <= r.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({ label: r.label, value: r.count }));
  }

  async getOrdersByAmount(startDateStr?: string, endDateStr?: string) {
    const where: any = {};
    
    if (startDateStr && endDateStr) {
      const startDate = this.parseDate(startDateStr);
      const endDate = this.parseDate(endDateStr);
      endDate.setHours(23, 59, 59, 999);
      where.paidAt = { not: null, gte: startDate, lte: endDate };
    } else {
      where.paidAt = { not: null };
    }

    const baskets = await this.prisma.basket.findMany({
      where,
      include: { 
        devices: { 
          include: { 
            device: { 
              select: { 
                price: true,
                discounts: {
                  select: { id: true, value: true, dateStart: true, dateEnd: true }
                }
              } 
            } 
          } 
        },
        deliveryOption: true
      }
    });

    const ranges = [
      { label: 'До 50К ₽', min: 0, max: 50000, count: 0 },
      { label: '50–100К ₽', min: 50000, max: 100000, count: 0 },
      { label: '100–250К ₽', min: 100000, max: 250000, count: 0 },
      { label: 'Более 250К ₽', min: 250000, max: Infinity, count: 0 },
    ];

    baskets.forEach(b => {
      const paidAt = b.paidAt!;
      
      let actualTotal = b.devices.reduce((sum, d) => {
        const basePrice = Number(d.device.price);
        const activeDiscount = d.device.discounts?.find(discount => 
          new Date(discount.dateStart) <= paidAt && 
          new Date(discount.dateEnd) >= paidAt
        );
        const discountValue = activeDiscount ? Number(activeDiscount.value) : 0;
        const finalPrice = discountValue > 0 
          ? basePrice * (1 - discountValue / 100) 
          : basePrice;
        return sum + finalPrice * d.quantity;
      }, 0);
      
      if (b.deliveryOption?.type === 'DELIVERY' && b.deliveryOption.price) {
        actualTotal += Number(b.deliveryOption.price);
      }
      
      const range = ranges.find(r => actualTotal >= r.min && actualTotal < r.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({ label: r.label, value: r.count }));
  }

  async getTimelineData(
    startDateStr: string, 
    endDateStr: string, 
    type: 'users' | 'types' | 'brands' | 'orders',
    filterId?: number
  ) {
    const startDate = this.parseDate(startDateStr);
    const endDate = this.parseDate(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    const days: { date: string; value: number }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      let value = 0;
      
      if (type === 'users') {
        value = await this.prisma.user.count({
          where: {
            role: 'CLIENT',
            createdAt: { gte: dayStart, lte: dayEnd }
          }
        });
      } 
      else if (type === 'orders') {
        value = await this.prisma.basket.count({
          where: {
            paidAt: { not: null, gte: dayStart, lte: dayEnd }
          }
        });
      }
      else if (type === 'types' || type === 'brands') {
        const where: any = {
          paidAt: { not: null, gte: dayStart, lte: dayEnd }
        };
        if (filterId) {
          where.devices = {
            some: {
              device: { [type === 'types' ? 'typeId' : 'brandId']: filterId }
            }
          };
        }
        const baskets = await this.prisma.basket.findMany({ 
          where, 
          include: { devices: true } 
        });
        value = baskets.reduce((sum, b) => sum + b.devices.reduce((s, d) => s + d.quantity, 0), 0);
      }
      
      days.push({
        date: currentDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  async getOrderDateRange() {
    const result = await this.prisma.basket.aggregate({
      _min: { paidAt: true },
      _max: { paidAt: true },
      where: { paidAt: { not: null } }
    });
    
    if (!result._min.paidAt || !result._max.paidAt) {
      return { start: null, end: null };
    }
    
    const start = new Date(result._min.paidAt);
    start.setDate(start.getDate() - 1);
    
    const end = new Date(result._max.paidAt);
    end.setDate(end.getDate() + 1);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  async getUserDateRange() {
    const result = await this.prisma.user.aggregate({
      _min: { createdAt: true },
      _max: { createdAt: true },
      where: { role: 'CLIENT' }
    });
    
    if (!result._min.createdAt || !result._max.createdAt) {
      return { start: null, end: null };
    }
    
    const start = new Date(result._min.createdAt);
    start.setDate(start.getDate() - 1);
    
    const end = new Date(result._max.createdAt);
    end.setDate(end.getDate() + 1);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  // ✅ Распределение заказов по типу доставки/самовывозу (только оплаченные с указанной доставкой)
  async getStatsByDelivery() {
    const baskets = await this.prisma.basket.findMany({
      where: { 
        paidAt: { not: null },
        deliveryOptionId: { not: null }
      },
      select: {
        deliveryOptionId: true,
        deliveryOption: {
          select: { id: true, name: true, type: true }
        }
      }
    });
    
    const counts: Record<number, { label: string; value: number }> = {};
    baskets.forEach(b => {
      const id = b.deliveryOptionId!;
      if (!counts[id]) {
        counts[id] = { 
          label: b.deliveryOption?.name || 'Неизвестно', 
          value: 0 
        };
      }
      counts[id].value++;
    });
    
    return Object.values(counts).sort((a, b) => b.value - a.value);
  }

  // ✅ График заказов по датам с фильтром по типу доставки
  async getTimelineByDelivery(
    startDateStr: string, 
    endDateStr: string, 
    deliveryOptionId?: number
  ) {
    const startDate = this.parseDate(startDateStr);
    const endDate = this.parseDate(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    
    const where: any = {
      paidAt: { not: null, gte: startDate, lte: endDate },
      deliveryOptionId: { not: null } // только заказы с указанной доставкой
    };
    
    if (deliveryOptionId) {
      where.deliveryOptionId = deliveryOptionId;
    }
    
    const baskets = await this.prisma.basket.findMany({
      where,
      select: { paidAt: true }
    });
    
    const byDay: Record<string, number> = {};
    baskets.forEach(b => {
      const day = new Date(b.paidAt!).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    
    // Заполняем все дни в диапазоне (даже с 0)
    const days: { date: string; value: number }[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayKey = currentDate.toISOString().split('T')[0];
      days.push({
        date: currentDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value: byDay[dayKey] || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  // ✅ Toggle доставки заказа (выдать/отменить)
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

  // ✅ Добавьте этот метод в конец класса BasketService
  async getAdminOrders(query: any) {
    const { page = 1, limit = 10, search, status, orderBy = 'paidAt', orderDir = 'desc' } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { paidAt: { not: null } }; // Только оплаченные
    
    // Поиск по email покупателя
    if (search) where.user = { email: { contains: search, mode: 'insensitive' } };
    
    // Фильтр по статусу
    if (status === 'pending') where.deliveredAt = null;
    if (status === 'delivered') where.deliveredAt = { not: null };

    // Сортировка (только безопасные поля для Prisma)
    const orderClause: any = {};
    if (orderBy === 'email') orderClause.user = { email: orderDir };
    else if (['id', 'paidAt', 'createdAt'].includes(orderBy)) orderClause[orderBy] = orderDir;
    else orderClause.paidAt = 'desc'; // fallback

    const [orders, total] = await Promise.all([
      this.prisma.basket.findMany({
        where, skip, take: Number(limit), orderBy: orderClause,
        include: {
          user: { select: { id: true, email: true } },
          devices: { 
            include: { 
              device: { 
                select: { 
                  id: true, name: true, price: true, 
                  discounts: { select: { id: true, value: true, dateStart: true, dateEnd: true } } 
                } 
              } 
            } 
          },
          deliveryOption: true,
        },
      }),
      this.prisma.basket.count({ where }),
    ]);

    // ✅ Расчёт итогов и скидок (аналогично getUserOrders)
    const enriched = orders.map(basket => {
      const paidAt = basket.paidAt!;
      let itemsTotal = 0;
      
      const devicesWithDiscount = basket.devices.map(bd => {
        const basePrice = Number(bd.device.price);
        const activeDiscount = bd.device.discounts?.find(d => 
          new Date(d.dateStart) <= paidAt && new Date(d.dateEnd) >= paidAt
        );
        const discountVal = activeDiscount ? Number(activeDiscount.value) : 0;
        const finalPrice = discountVal > 0 ? basePrice * (1 - discountVal / 100) : basePrice;
        
        itemsTotal += finalPrice * bd.quantity;
        return {
          id: bd.id,
          quantity: bd.quantity,
          device: { 
            name: bd.device.name, 
            basePrice, 
            finalPrice: Number(finalPrice.toFixed(2)), 
            discount: discountVal > 0 ? discountVal : null 
          },
          lineTotal: Number((finalPrice * bd.quantity).toFixed(2)),
        };
      });

      const deliveryCost = basket.deliveryOption?.type === 'DELIVERY' && basket.deliveryOption.price
        ? Number(basket.deliveryOption.price)
        : 0;

      return {
        ...basket,
        devices: devicesWithDiscount,
        total: Number((itemsTotal + deliveryCost).toFixed(2)),
      };
    });

    return {
      data: enriched,
      meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    };
  }

}