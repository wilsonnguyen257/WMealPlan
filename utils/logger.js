/**
 * Centralized Logging Utility
 * Provides structured logging for production monitoring
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const LOG_LEVEL_PRIORITY = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

class Logger {
  constructor(level = process.env.LOG_LEVEL || 'info') {
    this.level = level;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  shouldLog(level) {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[this.level];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    if (this.isProduction) {
      // JSON format for production log aggregation
      return JSON.stringify(logEntry);
    } else {
      // Human-readable format for development
      const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
    }
  }

  error(message, error = null, meta = {}) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;

    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code
        }
      })
    };

    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, errorMeta));

    // Send to error tracking service in production
    if (this.isProduction && process.env.ENABLE_ERROR_TRACKING === 'true') {
      this.sendToErrorTracking(message, error, errorMeta);
    }
  }

  warn(message, meta = {}) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
  }

  info(message, meta = {}) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
  }

  debug(message, meta = {}) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, meta));
  }

  // API request logging
  logRequest(req, res, duration) {
    this.info('API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.userId
    });
  }

  // Database operation logging
  logDbOperation(operation, table, duration, error = null) {
    if (error) {
      this.error(`Database ${operation} failed on ${table}`, error, { duration: `${duration}ms` });
    } else {
      this.debug(`Database ${operation} on ${table}`, { duration: `${duration}ms` });
    }
  }

  // AI API call logging
  logAiCall(endpoint, duration, tokens = null, error = null) {
    const meta = {
      endpoint,
      duration: `${duration}ms`,
      ...(tokens && { tokens })
    };

    if (error) {
      this.error('AI API call failed', error, meta);
    } else {
      this.info('AI API call successful', meta);
    }
  }

  // Placeholder for error tracking service integration
  // In production, integrate with services like Sentry, Datadog, etc.
  sendToErrorTracking(message, error, meta) {
    // Example: Sentry integration
    // if (Sentry) {
    //   Sentry.captureException(error, {
    //     extra: { message, ...meta }
    //   });
    // }
    
    // For now, just ensure it's logged
    this.debug('Error would be sent to tracking service', { message, meta });
  }
}

// Create singleton instance
const logger = new Logger();

// Express middleware for request logging
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Capture response end
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });

  next();
}

module.exports = {
  logger,
  requestLogger,
  LOG_LEVELS
};
