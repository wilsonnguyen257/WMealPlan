require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    console.log('Creating shared_plans table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS shared_plans (
        id SERIAL PRIMARY KEY,
        short_code VARCHAR(8) UNIQUE NOT NULL,
        meal_plan JSONB NOT NULL,
        preferences JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
      )
    `;
    
    console.log('Creating indexes...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_short_code ON shared_plans(short_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expires_at ON shared_plans(expires_at)`;
    
    console.log('✓ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
