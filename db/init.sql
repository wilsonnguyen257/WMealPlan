-- Shared Meal Plans Table
CREATE TABLE IF NOT EXISTS shared_plans (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(8) UNIQUE NOT NULL,
  meal_plan JSONB NOT NULL,
  preferences JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_short_code ON shared_plans(short_code);
CREATE INDEX IF NOT EXISTS idx_expires_at ON shared_plans(expires_at);
