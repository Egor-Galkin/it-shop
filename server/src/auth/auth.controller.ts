import { Controller, Post, Body, HttpCode, HttpStatus, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { Public } from './public.decorator'; // Создадим ниже
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // Регистрация (публичный эндпоинт)
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: CreateUserDto) {
    // При регистрации через auth роль всегда будет CLIENT (защита от эскалации привилегий)
    return this.usersService.create({ ...dto, role: undefined });
  }

  // Вход (публичный эндпоинт)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@Req() req: Request & { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }
}