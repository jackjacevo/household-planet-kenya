import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Define role hierarchy
    const roleHierarchy = {
      [UserRole.GUEST]: 0,
      [UserRole.CUSTOMER]: 1,
      [UserRole.STAFF]: 2,
      [UserRole.ADMIN]: 3,
      [UserRole.SUPER_ADMIN]: 4,
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = Math.min(...requiredRoles.map(role => roleHierarchy[role] || 0));

    return userRoleLevel >= requiredLevel;
  }
}