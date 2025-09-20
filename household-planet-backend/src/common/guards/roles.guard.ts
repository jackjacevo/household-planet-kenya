import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    
    console.log('RolesGuard - User:', user);
    console.log('RolesGuard - Required roles:', requiredRoles);
    console.log('RolesGuard - User role:', user?.role);
    
    // SUPER_ADMIN has access to everything
    if (user?.role === Role.SUPER_ADMIN || user?.role === 'SUPER_ADMIN') {
      console.log('RolesGuard - SUPER_ADMIN access granted');
      return true;
    }
    
    const hasAccess = requiredRoles.some((role) => user?.role === role);
    console.log('RolesGuard - Has access:', hasAccess);
    return hasAccess;
  }
}
