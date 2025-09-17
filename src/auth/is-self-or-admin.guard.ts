import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_SELF_OR_ADMIN_KEY } from './is-self-or-admin.decorator';

@Injectable()
export class IsSelfOrAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isSelfOrAdmin = this.reflector.getAllAndOverride<boolean>(
      IS_SELF_OR_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isSelfOrAdmin) {
      return true; // If the decorator is not present, this guard doesn't apply
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = request.user; // User from JWT payload (populated by JwtAuthGuard)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userIdFromParams = request.params.id; // User ID from URL parameter

    // Check if the authenticated user is the same as the user being updated
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isSelf = user && user.userId === userIdFromParams;

    // Check if the authenticated user has the 'admin' role
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const isAdmin = user && user.roles && user.roles.includes('admin');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return isSelf || isAdmin;
  }
}
