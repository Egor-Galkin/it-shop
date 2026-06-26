import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @Public()
  findAll(@Query('deviceId') deviceId?: string) {
    return this.discountsService.findAll(deviceId ? +deviceId : undefined);
  }

  @Get('active/:deviceId')
  @Public()
  getActive(@Param('deviceId') deviceId: string) {
    return this.discountsService.getActiveDiscount(+deviceId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountsService.update(+id, updateDiscountDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.discountsService.remove(+id);
  }
}