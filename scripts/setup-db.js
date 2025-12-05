#!/usr/bin/env node
require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function setupDatabase() {
  try {
    console.log('Setting up database...\n');
    
    // Create table
    console.log('Creating shared_plans table...');
    await sql`
      CREATE TABLE IF NOT EXISTS shared_plans (
        id SERIAL PRIMARY KEY,
        short_code VARCHAR(8) UNIQUE NOT NULL,
        meal_plan JSONB NOT NULL,
        preferences JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year')
      )
    `;
    console.log('✓ Table created');
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_short_code ON shared_plans(short_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expires_at ON shared_plans(expires_at)`;
    console.log('✓ Indexes created');
    
    // Test connection
    const result = await sql`SELECT COUNT(*) as count FROM shared_plans`;
    console.log(`✓ Database ready! Current shared plans: ${result.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

setupDatabase();
