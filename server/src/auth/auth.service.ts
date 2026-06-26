import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private prisma: PrismaService
  ) {}

  // Вход: проверка логина/пароля → выдача токена
  async login(dto: LoginUserDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.usersService.comparePassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Генерируем JWT
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    // Получаем значения с дефолтами, чтобы избежать undefined
  const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'fallback_secret';
  const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: jwtExpiresIn as any,
      }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Проверяем текущий пароль
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    // Хэшируем новый и обновляем
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}