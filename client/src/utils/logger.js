/**
 * Professional logging utility for WMealPlan
 * Replaces console.log with structured logging
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;
    
    if (data) {
      return `${prefix} ${message}`;
    }
    return `${prefix} ${message}`;
  }

  _shouldLog(level) {
    if (IS_PRODUCTION) {
      // In production, only log errors and warnings
      return level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN;
    }
    // In development, log everything
    return IS_DEVELOPMENT;
  }

  error(message, error = null) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this._formatMessage(LOG_LEVELS.ERROR, message));
      if (error) {
        console.error('Error details:', error);
      }
    }
    
    // In production, you could send to error tracking service
    // e.g., Sentry.captureException(error);
  }

  warn(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this._formatMessage(LOG_LEVELS.WARN, message));
      if (data) {
        console.warn('Data:', data);
      }
    }
  }

  info(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.info(this._formatMessage(LOG_LEVELS.INFO, message));
      if (data) {
        console.info('Data:', data);
      }
    }
  }

  debug(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this._formatMessage(LOG_LEVELS.DEBUG, message));
      if (data) {
        console.log('Data:', data);
      }
    }
  }

  // Specialized method for API calls
  apiCall(method, endpoint, status = null) {
    if (IS_DEVELOPMENT) {
      const message = status 
        ? `${method} ${endpoint} - Status: ${status}`
        : `${method} ${endpoint}`;
      this.debug(message);
    }
  }

  // Performance timing
  time(label) {
    if (IS_DEVELOPMENT) {
      console.time(`[${this.context}] ${label}`);
    }
  }

  timeEnd(label) {
    if (IS_DEVELOPMENT) {
      console.timeEnd(`[${this.context}] ${label}`);
    }
  }
}

// Create default logger instance
const logger = new Logger('WMealPlan');

// Export factory function for context-specific loggers
export const createLogger = (context) => new Logger(context);

export default logger;
