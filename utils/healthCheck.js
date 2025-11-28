/**
 * Health Check and Monitoring Endpoints
 * Provides system health information for monitoring services
 */

const { logger } = require('../utils/logger');
const { sql } = require('@vercel/postgres');

// Detailed health check with component status
async function healthCheck(req, res) {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    components: {}
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await sql`SELECT 1 as health_check`;
    health.components.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart
    };
  } catch (error) {
    health.components.database = {
      status: 'unhealthy',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Check Gemini API (lightweight check)
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    health.components.geminiApi = {
      status: apiKey ? 'configured' : 'not_configured'
    };
    if (!apiKey) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.components.geminiApi = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Firebase configuration
  try {
    health.components.firebase = {
      status: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not_configured'
    };
  } catch (error) {
    health.components.firebase = {
      status: 'error',
      error: error.message
    };
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.components.memory = {
    status: 'healthy',
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
  };

  health.responseTime = Date.now() - startTime;

  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  logger.debug('Health check performed', health);
  
  res.status(statusCode).json(health);
}

// Simple readiness probe (for load balancers)
function readiness(req, res) {
  res.status(200).json({ ready: true });
}

// Simple liveness probe (for orchestration platforms)
function liveness(req, res) {
  res.status(200).json({ alive: true });
}

// Metrics endpoint (basic metrics)
function metrics(req, res) {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };

  res.status(200).json(metrics);
}

module.exports = {
  healthCheck,
  readiness,
  liveness,
  metrics
};
