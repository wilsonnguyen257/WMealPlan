/**
 * Server-side logging utility for WMealPlan API
 * Structured logging with different levels and contexts
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

class ServerLogger {
  constructor(context = 'Server') {
    this.context = context;
  }

  _formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.context}] ${message}`;
  }

  error(message, error = null) {
    console.error(this._formatMessage(LOG_LEVELS.ERROR, message));
    if (error) {
      console.error('Error details:', error.message);
      if (!IS_PRODUCTION && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  }

  warn(message, data = null) {
    console.warn(this._formatMessage(LOG_LEVELS.WARN, message));
    if (data && !IS_PRODUCTION) {
      console.warn('Data:', data);
    }
  }

  info(message, data = null) {
    console.log(this._formatMessage(LOG_LEVELS.INFO, message));
    if (data && !IS_PRODUCTION) {
      console.log('Data:', data);
    }
  }

  debug(message, data = null) {
    if (!IS_PRODUCTION) {
      console.log(this._formatMessage(LOG_LEVELS.DEBUG, message));
      if (data) {
        console.log('Data:', data);
      }
    }
  }

  // HTTP request logging
  request(req) {
    const message = `${req.method} ${req.path}`;
    this.info(message);
  }

  // API call timing
  apiTiming(endpoint, duration) {
    this.debug(`API ${endpoint} completed in ${duration}ms`);
  }

  // Database operations
  db(operation, details = null) {
    this.debug(`DB ${operation}`, details);
  }
}

// Create loggers for different server components
const logger = new ServerLogger('API');
const dbLogger = new ServerLogger('Database');
const aiLogger = new ServerLogger('Gemini');

module.exports = {
  logger,
  dbLogger,
  aiLogger,
  createLogger: (context) => new ServerLogger(context)
};
