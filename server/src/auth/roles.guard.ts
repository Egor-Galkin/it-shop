import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../common/enums/role.enum';
import { SetMetadata } from '@nestjs/common';

// Декоратор для установки требуемых ролей
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    
    // Если роли не указаны — доступ разрешён всем авторизованным
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Добавляется JwtStrategy после валидации токена

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }
    
    return true;
  }
}