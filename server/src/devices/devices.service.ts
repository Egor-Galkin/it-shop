import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { QueryDevicesDto } from './dto/query-devices.dto';
import { deleteFile, isImageUsed, UPLOADS_DIR } from '../common/utils/file.utils';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {
    // Создаём папку uploads/devices если не существует
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  // ✅ Создание товара: сначала основной, потом связанные данные
  async create(dto: CreateDeviceDto) {
    // 1. Создаём основной товар без deviceInfos
    const { deviceInfos, ...mainData } = dto;
    
    const device = await this.prisma.device.create({
      data: {
        name: mainData.name,
        price: mainData.price,
        typeId: mainData.typeId,
        brandId: mainData.brandId,
        img: mainData.img,
        rating: mainData.rating,
      },
    });

    // 2. Если есть характеристики — создаём их отдельным запросом
    if (deviceInfos?.length) {
      const cleanInfos = deviceInfos
        .filter((info: any) => info.title?.trim() && info.description?.trim())
        .map((info: any) => ({
          deviceId: device.id,
          title: info.title.trim(),
          description: info.description.trim(),
        }));
      
      if (cleanInfos.length > 0) {
        await this.prisma.deviceInfo.createMany({
          data: cleanInfos,
        });
      }
    }

    // 3. Возвращаем товар с включёнными связями
    return this.findOne(device.id);
  }

  async findAll(query: QueryDevicesDto) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const orderByField = query.orderBy || 'createdAt';
    const orderDir = query.orderDir || 'desc';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.typeId) where.typeId = query.typeId;
    if (query.brandId) where.brandId = query.brandId;
    
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    const orderBy = orderByField === 'rating'
      ? { rating: { sort: orderDir as any, nulls: 'last' } as any }
      : { [orderByField]: orderDir };

    const [data, total] = await Promise.all([
      this.prisma.device.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          deviceInfos: true,
          type: { select: { name: true } },
          brand: { select: { name: true } },
          deviceImages: true,
          _count: { select: { ratings: true, basketItems: true } }
        },
      }),
      this.prisma.device.count({ where }),
    ]);

    const now = new Date();
    const deviceIds = data.map(d => d.id);
    const activeDiscounts = deviceIds.length > 0 
      ? await this.prisma.discount.findMany({
          where: { deviceId: { in: deviceIds }, dateStart: { lte: now }, dateEnd: { gte: now } }
        })
      : [];

    const enrichedData = data.map(device => {
      const discount = activeDiscounts.find(d => d.deviceId === device.id);
      const price = Number(device.price);
      const discountValue = discount ? Number(discount.value) : 0;
      const finalPrice = discountValue > 0 ? price * (1 - discountValue / 100) : price;

      return {
        ...device,
        discount: discount ? { id: discount.id, value: discountValue, dateEnd: discount.dateEnd.toISOString() } : null,
        finalPrice: Number(finalPrice.toFixed(2)),
      };
    });

    return {
      data: enrichedData,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ✅ findOne: проверка валидности id
  async findOne(id: number) {
    // Проверка на валидный id
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid device ID');
    }
    
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: { 
        deviceInfos: true, 
        type: { select: { name: true } }, 
        brand: { select: { name: true } }, 
        deviceImages: true,
        discounts: true, // ✅ Добавляем скидки для админки
      },
    });
    
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    const now = new Date();
    const discount = await this.prisma.discount.findFirst({
      where: { deviceId: id, dateStart: { lte: now }, dateEnd: { gte: now } },
    });

    const price = Number(device.price);
    const discountValue = discount ? Number(discount.value) : 0;
    const finalPrice = discountValue > 0 ? price * (1 - discountValue / 100) : price;

    return {
      ...device,
      discount: discount ? { id: discount.id, value: discountValue, dateEnd: discount.dateEnd.toISOString() } : null,
      finalPrice: Number(finalPrice.toFixed(2)),
    };
  }

  // ✅ Обновление: проверка существования + корректная обработка deviceInfos
  async update(id: number, dto: UpdateDeviceDto) {
    // Проверка на валидный id
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid device ID');
    }
    
    // Проверяем существование товара
    const existing = await this.prisma.device.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    const { deviceInfos, ...mainData } = dto;
    
    // 1. Обновляем основные данные товара
    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        name: mainData.name,
        price: mainData.price,
        typeId: mainData.typeId,
        brandId: mainData.brandId,
        img: mainData.img === '' ? null : mainData.img, // Пустая строка = null
        rating: mainData.rating,
      },
      include: { deviceInfos: true, type: { select: { name: true } }, brand: { select: { name: true } } },
    });

    // 2. Если переданы характеристики — полностью перезаписываем их
    if (deviceInfos !== undefined) {
      // Удаляем старые характеристики
      await this.prisma.deviceInfo.deleteMany({ where: { deviceId: id } });
      
      // Создаём новые (только заполненные)
      const cleanInfos = deviceInfos
        .filter((info: any) => info.title?.trim() && info.description?.trim())
        .map((info: any) => ({
          deviceId: id,
          title: info.title.trim(),
          description: info.description.trim(),
        }));
      
      if (cleanInfos.length > 0) {
        await this.prisma.deviceInfo.createMany({
          data: cleanInfos,
        });
      }
    }

    // 3. Возвращаем обновлённый товар
    return this.findOne(id);
  }

  // ✅ Удаление: каскадное через Prisma + очистка файлов
  async remove(id: number) {
    // Проверка на валидный id
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid device ID');
    }
    
    // Проверяем существование
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // Проверка на отзывы и заказы (бизнес-логика)
    const reviewCount = await this.prisma.rating.count({ where: { deviceId: id } });
    if (reviewCount > 0) {
      throw new BadRequestException(`Нельзя удалить: у товара есть отзывы (${reviewCount})`);
    }

    const basketCount = await this.prisma.basketDevice.count({ where: { deviceId: id } });
    if (basketCount > 0) {
      throw new BadRequestException(`Нельзя удалить: товар находится в корзинах/заказах (${basketCount})`);
    }

    // ✅ Удаляем все изображения товара (файлы + записи в БД)
    await this.deleteDeviceImages(id);

    // ✅ Prisma автоматически удалит связанные записи благодаря onDelete: Cascade
    return this.prisma.device.delete({ where: { id } });
  }

  // ✅ Обновление основного изображения
  async updateMainImage(deviceId: number, file: Express.Multer.File): Promise<{ img: string }> {
    if (!deviceId || isNaN(deviceId)) {
      throw new BadRequestException('Invalid device ID');
    }
    
    const device = await this.findOne(deviceId);
    const oldImagePath = device.img;
    
    const newImagePath = `/uploads/devices/${file.filename}`;
    
    const updated = await this.prisma.device.update({
      where: { id: deviceId },
      data: { img: newImagePath },
      select: { id: true, img: true }
    });

    // Удаляем старый файл, если он не используется
    if (oldImagePath && oldImagePath !== '/display.svg') {
      const isUsed = await isImageUsed(this.prisma, oldImagePath, deviceId);
      if (!isUsed) {
        deleteFile(oldImagePath);
      }
    }

    return { img: updated.img! };
  }

  // ✅ Добавление доп. изображения
  async addDeviceImage(deviceId: number, file: Express.Multer.File) {
    if (!deviceId || isNaN(deviceId)) {
      throw new BadRequestException('Invalid device ID');
    }
    
    await this.findOne(deviceId); // Проверка существования
    const imageUrl = `/uploads/devices/${file.filename}`;
    
    return this.prisma.deviceImage.create({
      data: { deviceId, img: imageUrl }
    });
  }

  // ✅ Удаление доп. изображения
  async removeDeviceImage(deviceId: number, imageId: number) {
    if (!deviceId || !imageId || isNaN(deviceId) || isNaN(imageId)) {
      throw new BadRequestException('Invalid ID');
    }
    
    const image = await this.prisma.deviceImage.findUnique({ where: { id: imageId } });
    if (!image || image.deviceId !== deviceId) {
      throw new NotFoundException('Изображение не найдено или не принадлежит этому товару');
    }

    const imagePath = image.img;
    
    // Сначала удаляем запись из БД
    await this.prisma.deviceImage.delete({ where: { id: imageId } });

    // Удаляем файл, если он не используется
    if (imagePath) {
      const isUsed = await isImageUsed(this.prisma, imagePath, deviceId);
      if (!isUsed) {
        deleteFile(imagePath);
      }
    }

    return { message: 'Image deleted' };
  }

  // ✅ Удаление всех изображений товара (при удалении товара)
  private async deleteDeviceImages(deviceId: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: { deviceImages: true }
    });

    if (!device) return;

    // Обрабатываем основное изображение
    if (device.img && device.img !== '/display.svg') {
      const isUsed = await isImageUsed(this.prisma, device.img, deviceId);
      if (!isUsed) {
        deleteFile(device.img);
      }
    }

    // Обрабатываем дополнительные изображения
    for (const extraImg of device.deviceImages) {
      if (extraImg.img) {
        const isUsed = await isImageUsed(this.prisma, extraImg.img, deviceId);
        if (!isUsed) {
          deleteFile(extraImg.img);
        }
      }
    }

    // Удаляем записи из БД (Prisma сделает это автоматически при onDelete: Cascade,
    // но для надёжности делаем явно)
    await this.prisma.deviceImage.deleteMany({ where: { deviceId } });
  }
}