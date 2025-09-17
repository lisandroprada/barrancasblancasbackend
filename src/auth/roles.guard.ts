import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, IS_PUBLIC_KEY } from './roles.decorator';
import { Request } from 'express';

interface JwtPayloadUser {
  userId: string;
  username: string;
  roles: string[];
}

interface AuthenticatedRequest extends Request {
  user: JwtPayloadUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('--- RolesGuard: canActivate ---');
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('RolesGuard: isPublic:', isPublic);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log('RolesGuard: requiredRoles:', requiredRoles);
    if (!requiredRoles) {
      console.log('RolesGuard: No required roles, allowing access.');
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;
    console.log('RolesGuard: User roles:', user ? user.roles : 'N/A');
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    console.log('RolesGuard: User has required role:', hasRole);
    return hasRole;
  }
}
