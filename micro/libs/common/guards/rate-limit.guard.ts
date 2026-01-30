import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY } from '../../../apps/auth/src/decorators/rate-limit.decorator';
import { REDIS } from '../src/redis/redis.module';

export interface RateLimitConfig {
  max: number;           // max requests
  windowMs: number;      // time window in milliseconds
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @Inject('REDIS_CLIENT') private redis: any,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<RateLimitConfig>(RATE_LIMIT_KEY, context.getHandler());
    
    if (!config) {
      return true; // No rate limit configured
    }

    const request = context.switchToHttp().getRequest();
    const identifier = request.user?.id || request.ip; // Use user ID if authenticated, else IP
    const key = `rate-limit:${identifier}:${request.method}:${request.path}`;

    const current = await this.redis.incr(key);
    
    if (current === 1) {
      // First request, set expiry
      await this.redis.pexpire(key, config.windowMs);
    }

    if (current > config.max) {
      throw new HttpException(
        `Too many requests. Max ${config.max} requests per ${config.windowMs}ms`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
