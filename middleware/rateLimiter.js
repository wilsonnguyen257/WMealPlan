/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and excessive requests
 */

// Simple in-memory rate limiter
// For production with multiple servers, consider using Redis
const requestCounts = new Map();

function rateLimiter(options = {}) {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skip = (req) => false
  } = options;

  return (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request log for this key
    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const requests = requestCounts.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    requestCounts.set(key, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= max) {
      return res.status(statusCode).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    validRequests.push(now);
    requestCounts.set(key, validRequests);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - validRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
}

// Cleanup old entries every hour to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, requests] of requestCounts.entries()) {
    const validRequests = requests.filter(time => time > now - oneHour);
    if (validRequests.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, validRequests);
    }
  }
}, 60 * 60 * 1000);

// Stricter rate limiter for AI generation endpoints
function aiRateLimiter() {
  return rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: 'AI generation rate limit exceeded. Please wait before trying again.',
    keyGenerator: (req) => {
      // Combine IP and user ID for authenticated requests
      const ip = req.ip || req.connection.remoteAddress;
      const userId = req.user?.userId;
      return userId ? `${ip}-${userId}` : ip;
    }
  });
}

module.exports = {
  rateLimiter,
  aiRateLimiter
};
