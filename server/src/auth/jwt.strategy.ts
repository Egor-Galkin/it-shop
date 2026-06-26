import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Берёт токен из заголовка "Authorization: Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Этот метод вызывается автоматически после декодирования токена
  async validate(payload: { sub: number; email: string; role: Role }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    
    // Возвращаем объект, который будет доступен как req.user
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}