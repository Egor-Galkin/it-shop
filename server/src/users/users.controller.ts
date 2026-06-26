import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  ForbiddenException, 
  Req, 
  Query 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ✅ GET /users?role=CLIENT&page=1&limit=10&search=email&orderBy=email&orderDir=asc
  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // 🔐 Смена пароля
  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request & { user?: { id: number; role: string } },
  ) {
    const userId = +id;
    const currentUser = req.user;

    if (currentUser?.id !== userId && currentUser?.role !== 'ADMIN') {
      throw new ForbiddenException('You can only change your own password');
    }

    return this.usersService.changePassword(userId, dto.oldPassword, dto.newPassword);
  }

  // ✅ GET /users/:id/reviews — отзывы пользователя
  @Get(':id/reviews')
  @Roles(Role.ADMIN)
  getUserReviews(@Param('id') id: string) {
    return this.usersService.getUserReviews(+id);
  }

  // ✅ GET /users/:id/orders — история заказов пользователя (оплаченные)
  @Get(':id/orders')
  @Roles(Role.ADMIN)
  getUserOrders(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.usersService.getUserOrders(+id, limit ? +limit : 100);
  }
}