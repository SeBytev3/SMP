import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiter for auth endpoints (register, login)
 * Limits to 10 requests per minute per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again in a minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for auth endpoints targeting specific emails.
 * Limits to 5 failed or successful requests per minute per email.
 */
export const emailRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each email to 5 requests per windowMs
  skip: () => process.env.NODE_ENV === 'test',
  keyGenerator: (req: Request) => {
    return req.body?.email?.toLowerCase().trim() || req.ip || 'anonymous';
  },
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts for this email. Please try again in a minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for messages to prevent spam.
 * Limits to 50 messages per hour per user.
 */
export const messageRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each user to 50 messages per windowMs
  skip: () => process.env.NODE_ENV === 'test',
  keyGenerator: (req: any) => {
    return req.userId || req.ip || 'anonymous';
  },
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Message limit reached. Please try again in an hour.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Global API rate limiter to mitigate scraper/DDoS attempts.
 * Limits to 200 requests per 15 minutes per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Simple request logger middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url } = req;
    const { statusCode } = res;
    
    console.log(`📡 [${new Date().toISOString()}] ${method} ${url} ${statusCode} - ${duration}ms`);
  });
  
  next();
};
