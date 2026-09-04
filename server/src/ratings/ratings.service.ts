import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto, AdminUpdateRatingDto } from './dto/update-rating.dto';
import { QueryRatingDto } from './dto/query-rating.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  private async recalculateDeviceRating(deviceId: number) {
    const stats = await this.prisma.rating.aggregate({
      where: { deviceId },
      _avg: { rate: true },
    });

    const newRating = stats._avg.rate ? parseFloat(stats._avg.rate.toFixed(2)) : null;

    await this.prisma.device.update({
      where: { id: deviceId },
      data: { rating: newRating },
    });
  }

  async create(userId: number, createRatingDto: CreateRatingDto) {
    const device = await this.prisma.device.findUnique({ where: { id: createRatingDto.deviceId } });
    if (!device) throw new NotFoundException(`Device with ID ${createRatingDto.deviceId} not found`);

    const exists = await this.prisma.rating.findUnique({
      where: { userId_deviceId: { userId, deviceId: createRatingDto.deviceId } }
    });
    if (exists) {
      throw new BadRequestException('You already have a review for this device. Use PATCH to update it.');
    }

    const newRating = await this.prisma.rating.create({
      data: {
        userId,
        deviceId: createRatingDto.deviceId,
        rate: createRatingDto.rate,
        description: createRatingDto.description,
        hidden: false,
      },
      include: {
        user: { select: { id: true, email: true } },
        device: { select: { id: true, name: true } },
      },
    });

    await this.recalculateDeviceRating(createRatingDto.deviceId);
    return newRating;
  }

  findAll(query: QueryRatingDto, userRole?: Role, currentUserId?: number) {
    const where: any = {};

    if (query.deviceId) {
      where.deviceId = +query.deviceId;
    }

    if (userRole === Role.ADMIN && query.hidden !== undefined && query.hidden !== null) {
      const hiddenValue = query.hidden === true || String(query.hidden).toLowerCase() === 'true';
      where.hidden = hiddenValue;
    }

    return this.prisma.rating.findMany({
      where,
      include: {
        user: { select: { id: true, email: true } },
        device: { select: { id: true, name: true, img: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userRole?: Role, currentUserId?: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true } },
        device: { select: { id: true, name: true } },
      },
    });
    if (!rating) throw new NotFoundException(`Rating with ID ${id} not found`);

    if (userRole !== Role.ADMIN && rating.userId !== currentUserId && rating.hidden) {
      throw new ForbiddenException('Access denied');
    }

    return rating;
  }

  async update(
    id: number,
    dto: UpdateRatingDto | AdminUpdateRatingDto,
    userRole: Role, 
    currentUserId: number
  ) {
    const rating = await this.prisma.rating.findUnique({ where: { id } });
    if (!rating) throw new NotFoundException(`Rating with ID ${id} not found`);

    if (userRole !== Role.ADMIN && rating.userId !== currentUserId) {
      throw new ForbiddenException('You can only edit your own review');
    }

    const data = userRole === Role.ADMIN 
      ? dto 
      : { rate: (dto as UpdateRatingDto).rate, description: (dto as UpdateRatingDto).description };

    const updatedRating = await this.prisma.rating.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true } },
        device: { select: { id: true, name: true } },
      },
    });

    await this.recalculateDeviceRating(rating.deviceId);
    return updatedRating;
  }

  async remove(id: number, userRole: Role, currentUserId: number) {
    const rating = await this.prisma.rating.findUnique({ where: { id } });
    if (!rating) throw new NotFoundException(`Rating with ID ${id} not found`);

    if (userRole !== Role.ADMIN && rating.userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own review');
    }

    const deviceId = rating.deviceId;
    await this.prisma.rating.delete({ where: { id } });
    await this.recalculateDeviceRating(deviceId);

    return { message: `Rating ${id} deleted successfully` };
  }

  async findByDevice(deviceId: number) {
    return this.prisma.rating.findMany({
      where: { deviceId },
      include: {
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async bulkToggleHidden(ids: number[], hidden: boolean) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Provide array of rating IDs');
    }

    const count = await this.prisma.rating.count({
      where: { id: { in: ids } }
    });
    if (count !== ids.length) {
      throw new NotFoundException('One or more ratings not found');
    }

    await this.prisma.rating.updateMany({
      where: { id: { in: ids } },
      data: { hidden },
    });

    const affected = await this.prisma.rating.findMany({
      where: { id: { in: ids } },
      select: { deviceId: true },
    });
    const uniqueDevices = [...new Set(affected.map(r => r.deviceId))];
    
    for (const deviceId of uniqueDevices) {
      await this.recalculateDeviceRating(deviceId);
    }

    return { message: `${ids.length} ratings updated`, hidden };
  }

  async getAdminReviews(query: any) {
    const { page = 1, limit = 10, search, status, orderBy = 'createdAt', orderDir = 'desc' } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) where.user = { email: { contains: search, mode: 'insensitive' } };
    
    if (status === 'visible') where.hidden = false;
    if (status === 'hidden') where.hidden = true;

    const orderClause: any = {};
    if (orderBy === 'email') orderClause.user = { email: orderDir };
    else if (orderBy === 'device') orderClause.device = { name: orderDir };
    else if (['id', 'rate', 'createdAt'].includes(orderBy)) orderClause[orderBy] = orderDir;
    else orderClause.createdAt = 'desc';

    const [reviews, total] = await Promise.all([
      this.prisma.rating.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: orderClause,
        include: {
          user: { select: { id: true, email: true } },
          device: { select: { id: true, name: true } },
        },
      }),
      this.prisma.rating.count({ where }),
    ]);

    return {
      data: reviews,
      meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    };
  }

  async toggleHidden(reviewId: number, hidden: boolean) {
    return this.prisma.rating.update({
      where: { id: reviewId },
      data: { hidden },
      include: {
        user: { select: { email: true } },
        device: { select: { name: true } },
      },
    });
  }

}