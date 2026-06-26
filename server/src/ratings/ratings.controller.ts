import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  Req,
  ForbiddenException, 
  BadRequestException
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto, AdminUpdateRatingDto } from './dto/update-rating.dto';
import { QueryRatingDto } from './dto/query-rating.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Request } from 'express';
import { Public } from '../auth/public.decorator'; // или из auth.controller

// Тип для req.user
type RequestWithUser = Request & { user?: { id: number; role: Role } };

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  create(@Body() createRatingDto: CreateRatingDto, @Req() req: RequestWithUser) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.ratingsService.create(req.user.id, createRatingDto);
  }

  // ✅ Публичные маршруты
  @Get()
  @Public()
  findAll(@Query() query: QueryRatingDto, @Req() req: RequestWithUser) {
    const userRole = req.user?.role;
    const currentUserId = req.user?.id;
    return this.ratingsService.findAll(query, userRole, currentUserId);
  }

  @Get('device/:deviceId')
  @Public()
  findByDevice(@Param('deviceId') deviceId: string) {
    return this.ratingsService.findByDevice(+deviceId);
  }

  // ✅ ВАЖНО: Специфичный маршрут /ratings/admin должен идти ПЕРЕД /ratings/:id
  @Get('admin')
  @Roles(Role.ADMIN)
  async getAdminReviews(@Query() query: any) {
    return this.ratingsService.getAdminReviews(query);
  }

  // ✅ Параметризованный маршрут — в конце
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    // ✅ Защита от невалидного ID
    const numericId = +id;
    if (!id || isNaN(numericId)) {
      throw new BadRequestException('Invalid rating ID');
    }
    return this.ratingsService.findOne(numericId, req.user?.role, req.user?.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto | AdminUpdateRatingDto,
    @Req() req: RequestWithUser
  ) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    
    const numericId = +id;
    if (!id || isNaN(numericId)) {
      throw new BadRequestException('Invalid rating ID');
    }
    
    const updateDto = req.user.role === Role.ADMIN 
      ? updateRatingDto as AdminUpdateRatingDto 
      : updateRatingDto as UpdateRatingDto;
    
    return this.ratingsService.update(numericId, updateDto, req.user.role, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    
    const numericId = +id;
    if (!id || isNaN(numericId)) {
      throw new BadRequestException('Invalid rating ID');
    }
    
    return this.ratingsService.remove(numericId, req.user.role, req.user.id);
  }

  @Patch('bulk-toggle-hidden')
  @Roles(Role.ADMIN)
  async bulkToggleHidden(@Body() body: { ids: number[]; hidden: boolean }) {
    return this.ratingsService.bulkToggleHidden(body.ids, body.hidden);
  }

  @Patch(':id/toggle')
  @Roles(Role.ADMIN)
  async toggleHidden(@Param('id') id: string, @Body() dto: { hidden: boolean }) {
    const numericId = +id;
    if (!id || isNaN(numericId)) {
      throw new BadRequestException('Invalid rating ID');
    }
    return this.ratingsService.toggleHidden(numericId, dto.hidden);
  }
}