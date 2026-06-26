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
import { BasketService } from './basket.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Request } from 'express';
import { Public } from '../auth/public.decorator';

type RequestWithUser = Request & { user?: { id: number; role: Role } };

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  // Получить активную корзину (или создать) — для клиента
  @Get('me')
  async getMyBasket(@Req() req: RequestWithUser) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.getOrCreateActive(req.user.id);
  }

  // Добавить товар в корзину — для клиента
  @Post('me/items')
  async addItem(@Body() dto: AddItemDto, @Req() req: RequestWithUser) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.addItem(req.user.id, dto);
  }

  // Обновить способ получения для корзины — для клиента
  @Patch('me')
  async updateDeliveryOption(
    @Body() dto: { deliveryOptionId: number | null },
    @Req() req: RequestWithUser
  ) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.setDeliveryOption(req.user.id, dto.deliveryOptionId);
  }

  // Обновить количество товара — для клиента
  @Patch('me/items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
    @Req() req: RequestWithUser
  ) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.updateItem(req.user.id, +id, dto);
  }

  // Удалить товар из корзины — для клиента
  @Delete('me/items/:id')
  async removeItem(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.removeItem(req.user.id, +id);
  }

  // Очистить корзину — для клиента
  @Delete('me/clear')
  async clear(@Req() req: RequestWithUser) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.clear(req.user.id);
  }

  // Оплатить корзину (перевод в историю) — для клиента
  @Post('me/checkout')
  async checkout(@Req() req: RequestWithUser) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.checkout(req.user.id);
  }

  // История заказов — для клиента
  @Get('me/history')
  async getHistory(@Req() req: RequestWithUser, @Query('limit') limit?: string) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.getOrderHistory(req.user.id, limit ? +limit : 10);
  }

  // [ADMIN] Получить все корзины (с фильтрацией)
  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query() query: { userId?: string; paid?: string; limit?: string }) {
    return this.basketService.findAll({
      userId: query.userId ? +query.userId : undefined,
      paid: query.paid === 'true' ? true : query.paid === 'false' ? false : undefined,
      limit: query.limit ? +query.limit : undefined
    });
  }

  // [ADMIN] Получить корзину по ID (только просмотр)
  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.basketService.findOneById(+id);
  }

  // Отменить заказ (только для владельца)
  @Patch('me/orders/:id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Req() req: RequestWithUser
  ) {
    if (!req.user) throw new ForbiddenException('Authorization required');
    return this.basketService.cancelOrder(req.user.id, +id);
  }

  // [ADMIN] Дашборд статистики
  @Get('admin/stats/dashboard')
  @Roles(Role.ADMIN)
  async getDashboardStats() {
    return this.basketService.getDashboardStats();
  }

  // [ADMIN] Статистика по типам
  @Get('admin/stats/by-type')
  @Roles(Role.ADMIN)
  async getStatsByType() {
    return this.basketService.getStatsByType();
  }

  // [ADMIN] Статистика по брендам
  @Get('admin/stats/by-brand')
  @Roles(Role.ADMIN)
  async getStatsByBrand() {
    return this.basketService.getStatsByBrand();
  }

  // [ADMIN] Динамика заказов
  @Get('admin/stats/trend')
  @Roles(Role.ADMIN)
  async getOrderTrend(@Query('days') days?: string) {
    return this.basketService.getOrderTrend(days ? +days : 30);
  }

  // [ADMIN] Статистика по пользователям
  @Get('admin/stats/by-users')
  @Roles(Role.ADMIN)
  async getUsersByPurchases(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.basketService.getUsersByPurchases(startDate, endDate);
  }

  // [ADMIN] Статистика по заказам
  @Get('admin/stats/by-orders')
  @Roles(Role.ADMIN)
  async getOrdersByAmount(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.basketService.getOrdersByAmount(startDate, endDate);
  }

  // [ADMIN] Динамика по датам
  @Get('admin/stats/timeline')
  @Roles(Role.ADMIN)
  async getTimelineData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type: 'users' | 'types' | 'brands' | 'orders',
    @Query('filterId') filterId?: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.basketService.getTimelineData(
      startDate,
      endDate,
      type,
      filterId ? +filterId : undefined
    );
  }

  // [ADMIN] Диапазон дат для заказов/типов/брендов
  @Get('admin/stats/date-range/orders')
  @Roles(Role.ADMIN)
  async getOrderDateRange() {
    return this.basketService.getOrderDateRange();
  }

  // [ADMIN] Диапазон дат для пользователей
  @Get('admin/stats/date-range/users')
  @Roles(Role.ADMIN)
  async getUserDateRange() {
    return this.basketService.getUserDateRange();
  }
  
  // [ADMIN] Статистика по доставкам (распределение)
  @Get('admin/stats/by-delivery')
  @Roles(Role.ADMIN)
  async getStatsByDelivery() {
    return this.basketService.getStatsByDelivery();
  }

  // [ADMIN] График заказов по доставкам с фильтром
  @Get('admin/stats/timeline-by-delivery')
  @Roles(Role.ADMIN)
  async getTimelineByDelivery(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('deliveryOptionId') deliveryOptionId?: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.basketService.getTimelineByDelivery(
      startDate,
      endDate,
      deliveryOptionId ? +deliveryOptionId : undefined
    );
  }

  // ✅ PATCH /basket/:id/deliver — выдать/отменить доставку заказа
  @Patch(':id/deliver')
  @Roles(Role.ADMIN)
  async toggleDelivery(
    @Param('id') id: string,
    @Body() dto: { deliveredAt: string | null },
  ) {
    return this.basketService.toggleDelivery(+id, dto.deliveredAt);
  }

  // ✅ Добавьте этот метод в BasketController
  @Get('admin/orders')
  @Roles(Role.ADMIN)
  async getAdminOrders(@Query() query: any) {
    return this.basketService.getAdminOrders(query);
  }

}