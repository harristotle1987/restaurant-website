import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a single reusable connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection established');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    
    // 1. Verify table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'menu_items'
      );
    `);
    
    if (!tableExists.rows[0]?.exists) {
      return NextResponse.json(
        { error: "Database table 'menu_items' does not exist" },
        { status: 500 }
      );
    }

    // 2. Fetch data
    const result = await client.query(`
      SELECT 
        id,
        name,
        description,
        price,
        category,
        popular
      FROM menu_items
    `);
    
    return NextResponse.json(result.rows);
    
  } catch (error) {
    // Detailed error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      dbConfig: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      }
    });
    
    return NextResponse.json(
      { 
        error: "Database operation failed",
        message: error.message,
        suggestion: "Check database connection and table existence"
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}