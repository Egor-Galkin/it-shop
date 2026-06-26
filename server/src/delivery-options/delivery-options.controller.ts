import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { DeliveryOptionsService } from './delivery-options.service';
import { CreateDeliveryOptionDto } from './dto/create-delivery-option.dto';
import { UpdateDeliveryOptionDto } from './dto/update-delivery-option.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';

@Controller('delivery-options')
export class DeliveryOptionsController {
  constructor(private readonly deliveryOptionsService: DeliveryOptionsService) {}

  // [ADMIN] CRUD
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDeliveryOptionDto: CreateDeliveryOptionDto) {
    return this.deliveryOptionsService.create(createDeliveryOptionDto);
  }

  // ✅ Админ-список с сортировкой
  @Get('admin')
  @Roles(Role.ADMIN)
  async getAdminList(@Query() query: any) {
    return this.deliveryOptionsService.getAdminList(query);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('active') active?: string) {
    const activeOnly = active !== 'false';
    return this.deliveryOptionsService.findAll(activeOnly);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.deliveryOptionsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDeliveryOptionDto: UpdateDeliveryOptionDto) {
    return this.deliveryOptionsService.update(+id, updateDeliveryOptionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const numericId = +id;
    if (await this.deliveryOptionsService.isUsedInOrders(numericId)) {
      throw new BadRequestException('Нельзя удалить: вариант используется в заказах');
    }
    return this.deliveryOptionsService.remove(numericId);
  }

  // [CLIENT] Получить доступные варианты
  @Get('client/available')
  @Public()
  getAvailableForClient() {
    return this.deliveryOptionsService.getAvailableForClient();
  }
}