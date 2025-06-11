import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter that allows 20 requests per 10 seconds for general API routes
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// Create a limiter for URL creation (10 requests per minute)
export const urlCreationLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/url-creation',
});

// Create a limiter for URL deletion (5 requests per minute)
export const urlDeletionLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/url-deletion',
});

// Create a limiter for URL redirection (200 requests per minute)
export const urlRedirectLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(200, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/url-redirect',
}); 