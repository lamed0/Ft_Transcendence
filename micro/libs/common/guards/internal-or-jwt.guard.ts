import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

@Injectable()
export class InternalOrJwtGuard implements CanActivate {
  constructor(private jwtGuard: JwtAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check for internal token first
    const internalToken = request.headers['x-internal-token'];
    if (internalToken === process.env.INTERNAL_TOKEN) {
      return true; // Allow internal service calls
    }

    // Fall back to JWT validation
    try {
      const result = await this.jwtGuard.canActivate(context);
      return !!result;
    } catch (error) {
      throw new UnauthorizedException('Invalid or missing token');
    }
  }
}

