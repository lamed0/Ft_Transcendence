import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitConfig {
  max: number;      // max requests
  windowMs: number; // time window in milliseconds
}

/**
 * Rate limit decorator
 * @example @RateLimit({ max: 5, windowMs: 60000 }) // 5 requests per minute
 */
export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);
