/**
 * Security Middleware
 * Implements security best practices for production
 */

// Security headers middleware
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable browser XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://generativelanguage.googleapis.com https://*.firebase.googleapis.com https://*.firebaseio.com; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );
  }
  
  // Strict Transport Security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
}

// Request size limiter
function requestSizeLimiter(maxSize = '10mb') {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
      const size = parseInt(contentLength);
      const maxBytes = parseSize(maxSize);
      if (size > maxBytes) {
        return res.status(413).json({
          success: false,
          error: 'Request payload too large'
        });
      }
    }
    next();
  };
}

function parseSize(size) {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // default 10MB
  return parseInt(match[1]) * (units[match[2]] || 1);
}

// Sanitize input middleware
function sanitizeInput(req, res, next) {
  // Remove any potential script tags or dangerous HTML from text inputs
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
}

// API key validation for sensitive endpoints
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (validKeys.length > 0 && !validKeys.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key'
    });
  }
  
  next();
}

module.exports = {
  securityHeaders,
  requestSizeLimiter,
  sanitizeInput,
  validateApiKey
};
