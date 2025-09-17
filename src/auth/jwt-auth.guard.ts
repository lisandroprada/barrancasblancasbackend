import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator'; // Corrected import

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('--- JwtAuthGuard: canActivate ---');
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('JwtAuthGuard: isPublic:', isPublic);
    if (isPublic) {
      return true;
    }

    const result = (await super.canActivate(context)) as boolean;
    console.log('JwtAuthGuard: super.canActivate result:', result);

    if (!result) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
