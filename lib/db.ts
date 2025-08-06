import { Client, Pool } from 'pg';

interface CustomError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  address?: string;
  port?: number;
}

// Use Pool for better connection management in serverless environment
let pool: Pool | null = null;

// Database configuration with enhanced error handling
function getDBConfig() {
  // Priority: POSTGRES_URL (Vercel) > DATABASE_URL > Individual params
  if (process.env.POSTGRES_URL) {
    console.log('ℹ️ Using POSTGRES_URL for Vercel connection');
    return {
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
      } : false,
    };
  }
  
  if (process.env.DATABASE_URL) {
    console.log('ℹ️ Using DATABASE_URL for connection');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
      } : false,
    };
  }
  
  console.log('ℹ️ Using individual DB parameters for connection');
  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: process.env.NODE_ENV === 'production' ? { 
      rejectUnauthorized: false 
    } : false,
  };
}

// Initialize connection pool
function initializePool(): Pool {
  if (!pool) {
    const config = getDBConfig();
    
    pool = new Pool({
      ...config,
      // Serverless optimizations
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: process.env.NODE_ENV === 'production' ? 1 : 5, // Single connection for serverless
      min: 0, // No minimum connections for serverless
    });

    // Enhanced error handling
    pool.on('error', (err: CustomError) => {
      console.error('Unexpected database pool error:', err);
      
      // Handle specific error codes
      if (err.code === 'ECONNREFUSED') {
        console.error('❌ Database connection refused. Check if database is running.');
      } else if (err.code === '28P01') {
        console.error('❌ Authentication failure. Check credentials.');
      } else if (err.code === '3D000') {
        console.error('❌ Database does not exist.');
      }
    });

    pool.on('connect', () => {
      console.log('✅ New database connection established');
    });

    pool.on('remove', () => {
      console.log('🔄 Database connection removed from pool');
    });

    console.log('✅ Database pool initialized');
  }
  
  return pool;
}

// Test database connection
export async function testConnection(retries = 2): Promise<boolean> {
  const pool = initializePool();
  
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1 as test');
      client.release();
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      const err = error as CustomError;
      
      if (i === retries - 1) {
        console.error(`❌ Database connection test failed after ${retries} attempts:`, err.message);
        
        // Log specific error details
        if (err.code === 'ECONNREFUSED') {
          console.error('Connection refused - database may not be running or accessible');
        } else if (err.code === '28P01') {
          console.error('Authentication failed - check username/password');
        } else if (err.code === 'ETIMEDOUT') {
          console.error('Connection timeout - database may be unreachable');
        }
        
        throw err;
      }
      
      console.warn(`⚠️ Connection test failed (attempt ${i+1}/${retries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return false;
}

// Get database client from pool
export async function getDBClient() {
  const pool = initializePool();
  
  try {
    const client = await pool.connect();
    
    // Verify connection is alive
    await client.query('SELECT 1');
    
    return client;
  } catch (error) {
    const err = error as CustomError;
    console.error('❌ Failed to get database client:', err.message);
    
    // Enhanced error reporting
    if (err.code === 'ECONNREFUSED') {
      throw new Error('Database connection refused. Check if database is running.');
    } else if (err.code === '28P01') {
      throw new Error('Database authentication failed. Check credentials.');
    } else if (err.code === 'ETIMEDOUT') {
      throw new Error('Database connection timeout. Database may be unreachable.');
    }
    
    throw err;
  }
}

// Legacy support - connect using Client (not recommended for serverless)
export async function connectDB(): Promise<Client> {
  console.warn('⚠️ connectDB() using Client is not recommended for serverless. Use getDBClient() instead.');
  
  const config = getDBConfig();
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Verify connection
    const { rows } = await client.query('SELECT current_user, current_database()');
    console.log(`🔑 Connected as: ${rows[0].current_user} to database: ${rows[0].current_database}`);
    
    return client;
  } catch (err) {
    const error = err as CustomError;
    console.error('❌ Failed to connect to database');
    
    // Enhanced error logging
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Handle specific PostgreSQL error codes
    if (error.code === '28P01') {
      console.error('Authentication failure. Verify DB credentials.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Check if database is running.');
    } else if (error.code === '3D000') {
      console.error('Database does not exist.');
    }
    
    throw err;
  }
}

/**
 * Executes a parameterized SQL query using connection pool.
 */
export async function queryDB(text: string, params?: any[]) {
  const client = await getDBClient();
  
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🕒 Query executed in ${duration}ms: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`, 
                  params ? `Params: ${JSON.stringify(params)}` : '');
    }
    
    return result;
  } catch (error) {
    const err = error as CustomError;
    console.error('❌ Query error:', {
      query: text.substring(0, 200),
      params: params ? JSON.stringify(params) : 'none',
      error: err.message,
      code: err.code
    });
    throw error;
  } finally {
    client.release(); // Always release the client back to the pool
  }
}

/**
 * Execute a transaction with automatic rollback on error.
 */
export async function executeTransaction(queries: Array<{ text: string; params?: any[] }>) {
  const client = await getDBClient();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const query of queries) {
      const result = await client.query(query.text, query.params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    console.log('✅ Transaction completed successfully');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction failed, rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if a table exists.
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await queryDB(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ Error checking if table '${tableName}' exists:`, error);
    return false;
  }
}

/**
 * Closes the database connection pool.
 */
export async function closeDB() {
  if (pool) {
    try {
      await pool.end();
      console.log('🔒 Database connection pool closed');
    } catch (err) {
      console.error('Error closing database connection pool:', err);
    } finally {
      pool = null;
    }
  }
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, closing database connections...');
    await closeDB();
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, closing database connections...');
    await closeDB();
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    if (reason instanceof Error && reason.message.includes('Connection terminated unexpectedly')) {
      console.warn('⚠️ Database connection lost unexpectedly');
      // Don't auto-reconnect in serverless - let the next request handle it
      pool = null;
    }
  });
}

// Export pool for direct access if needed
export { pool };