/**
 * User Feedback System
 * Allows users to submit feedback, bug reports, and feature requests
 */

const { sql } = require('@vercel/postgres');
const { logger } = require('../utils/logger');

// Initialize feedback table
async function initFeedbackTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        email TEXT,
        type TEXT NOT NULL,
        category TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER,
        url TEXT,
        user_agent TEXT,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_feedback_user_id 
      ON user_feedback(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_feedback_status 
      ON user_feedback(status)
    `;

    logger.info('Feedback table initialized');
  } catch (error) {
    logger.error('Error initializing feedback table', error);
  }
}

// Auto-initialize
initFeedbackTable();

// Feedback types
const FEEDBACK_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature_request',
  GENERAL: 'general_feedback',
  SUPPORT: 'support_request',
  RATING: 'rating'
};

const FEEDBACK_CATEGORIES = {
  MEAL_PLANNING: 'meal_planning',
  RECIPES: 'recipes',
  GROCERY_LIST: 'grocery_list',
  AUTHENTICATION: 'authentication',
  PERFORMANCE: 'performance',
  UI_UX: 'ui_ux',
  OTHER: 'other'
};

const FEEDBACK_STATUS = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Save feedback
async function saveFeedback(data) {
  try {
    const {
      userId,
      email,
      type,
      category,
      subject,
      message,
      rating,
      url,
      userAgent
    } = data;

    // Validate required fields
    if (!type || !subject || !message) {
      throw new Error('Type, subject, and message are required');
    }

    // Validate type
    if (!Object.values(FEEDBACK_TYPES).includes(type)) {
      throw new Error('Invalid feedback type');
    }

    const result = await sql`
      INSERT INTO user_feedback (
        user_id, email, type, category, subject, message, rating, url, user_agent
      )
      VALUES (
        ${userId || null},
        ${email || null},
        ${type},
        ${category || null},
        ${subject},
        ${message},
        ${rating || null},
        ${url || null},
        ${userAgent || null}
      )
      RETURNING id
    `;

    const feedbackId = result.rows[0].id;

    logger.info('Feedback submitted', {
      feedbackId,
      type,
      category,
      userId: userId || 'anonymous'
    });

    return feedbackId;
  } catch (error) {
    logger.error('Error saving feedback', error);
    throw error;
  }
}

// Get feedback by user
async function getUserFeedback(userId, limit = 10) {
  try {
    const result = await sql`
      SELECT id, type, category, subject, status, created_at
      FROM user_feedback
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows;
  } catch (error) {
    logger.error('Error getting user feedback', error);
    throw error;
  }
}

// Get all feedback (admin only - for future admin panel)
async function getAllFeedback(filters = {}, limit = 50, offset = 0) {
  try {
    let query = 'SELECT * FROM user_feedback WHERE 1=1';
    const params = [];

    if (filters.type) {
      params.push(filters.type);
      query += ` AND type = $${params.length}`;
    }

    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await sql.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Error getting all feedback', error);
    throw error;
  }
}

// Update feedback status
async function updateFeedbackStatus(feedbackId, status) {
  try {
    if (!Object.values(FEEDBACK_STATUS).includes(status)) {
      throw new Error('Invalid status');
    }

    await sql`
      UPDATE user_feedback
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${feedbackId}
    `;

    logger.info('Feedback status updated', { feedbackId, status });
  } catch (error) {
    logger.error('Error updating feedback status', error);
    throw error;
  }
}

module.exports = {
  FEEDBACK_TYPES,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUS,
  saveFeedback,
  getUserFeedback,
  getAllFeedback,
  updateFeedbackStatus
};
