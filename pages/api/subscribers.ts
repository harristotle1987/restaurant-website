import { Pool } from 'pg';
import type { NextApiRequest, NextApiResponse } from 'next';

interface CustomError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  address?: string;
  port?: number;
}

// Create a single pool instance to be reused
let pool: Pool | null = null;

// Initialize the database connection pool
function initializePool() {
  if (!pool) {
    try {
      let connectionConfig;
      
      // For Vercel production, use POSTGRES_URL
      if (process.env.POSTGRES_URL) {
        console.log('ℹ️ Using POSTGRES_URL for Vercel connection');
        connectionConfig = {
          connectionString: process.env.POSTGRES_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      } else if (process.env.DATABASE_URL) {
        console.log('ℹ️ Using DATABASE_URL for connection');
        connectionConfig = {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      } else {
        console.log('ℹ️ Using individual DB parameters for connection');
        connectionConfig = {
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      }

      pool = new Pool({
        ...connectionConfig,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased for serverless
        max: process.env.NODE_ENV === 'production' ? 1 : 5, // Serverless optimization
      });

      // Add error handling to the pool
      pool.on('error', (err) => {
        console.error('Unexpected database pool error:', err);
      });

      console.log('✅ Database pool initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database pool:', error);
      throw error;
    }
  }
  return pool;
}

// Check if the subscribers table exists
async function checkTableExists() {
  const pool = initializePool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscribers'
      )
    `);
    return result.rows[0].exists;
  } catch (error) {
    console.error('Table check failed:', error);
    return false;
  } finally {
    client.release();
  }
}

// Test database connection with retry
async function testConnection(retries = 2, delay = 500) { // Reduced for serverless
  const pool = initializePool();
  
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`❌ Database connection test failed after ${retries} attempts`);
        throw error;
      }
      console.warn(`⚠️ Connection test failed (attempt ${i+1}/${retries}), retrying...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  return false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST'] 
    });
  }

  try {
    // Initialize pool on first request
    initializePool();
    
    // Test database connection before proceeding
    await testConnection();
    
    const { email } = req.body;
    
    // Validate input
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Check if table exists
    const tableExists = await checkTableExists();
    if (!tableExists) {
      return res.status(500).json({
        error: 'Database configuration error',
        details: 'Subscribers table does not exist. Please run database setup.'
      });
    }

    const client = await pool!.connect();
    
    try {
      // Check if email exists
      const existing = await client.query(
        `SELECT id, is_active FROM subscribers WHERE email = $1`,
        [email]
      );

      if (existing.rows.length > 0) {
        const subscriber = existing.rows[0];
        if (subscriber.is_active) {
          return res.status(409).json({ 
            error: 'Email already subscribed',
            subscriberId: subscriber.id
          });
        }

        // Reactivate inactive subscriber
        await client.query(
          `UPDATE subscribers 
           SET is_active = TRUE, unsubscribed_at = NULL, updated_at = CURRENT_TIMESTAMP
           WHERE email = $1`,
          [email]
        );
        return res.status(200).json({ 
          success: true,
          message: 'Subscription reactivated',
          subscriberId: subscriber.id
        });
      }

      // Insert new subscriber
      const result = await client.query(
        `INSERT INTO subscribers (email, is_active, subscribed_at, created_at, updated_at) 
         VALUES ($1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING id, subscribed_at`,
        [email]
      );

      return res.status(201).json({ 
        success: true, 
        message: 'Successfully subscribed to newsletter',
        subscriberId: result.rows[0].id,
        subscribedAt: result.rows[0].subscribed_at
      });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    const err = error as CustomError;
    console.error('Subscribers API error:', err);
    
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    // Handle specific PostgreSQL error codes
    if (err.code) {
      switch (err.code) {
        case '23505': // Unique violation
          statusCode = 409;
          errorMessage = 'Email already subscribed';
          break;
        case '28P01': // Authentication failure
          statusCode = 503;
          errorMessage = 'Database authentication failed';
          break;
        case '3D000': // Database does not exist
          statusCode = 500;
          errorMessage = 'Database not found';
          break;
        case 'ECONNREFUSED': // Connection refused
          statusCode = 503;
          errorMessage = 'Database connection failed';
          break;
        case 'ETIMEDOUT': // Connection timeout
          statusCode = 504;
          errorMessage = 'Database connection timeout';
          break;
        case '42P01': // Table does not exist
          statusCode = 500;
          errorMessage = 'Database table not found';
          break;
      }
    }
    
    // Handle Node.js connection errors
    if (err.errno === -111 || err.syscall === 'connect') {
      statusCode = 503;
      errorMessage = 'Database connection refused';
    }

    return res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' 
        ? err.message || err.toString() 
        : undefined
    });
  }
}