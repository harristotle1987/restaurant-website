import { Client } from 'pg';

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'restaurant_db',
  password: process.env.DB_PASSWORD || 'Colony082987@',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

let client: Client | null = null;

/**
 * Connects to PostgreSQL database using a singleton client.
 */
export async function connectDB(): Promise<Client> {
  if (!client) {
    client = new Client(dbConfig);
    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL database');
    } catch (err) {
      console.error('❌ Failed to connect to database:', err);
      throw err;
    }
  }
  return client;
}

/**
 * Executes a parameterized SQL query.
 */
export async function queryDB(text: string, params?: any[]) {
  const dbClient = await connectDB();
  try {
    const start = Date.now();
    const result = await dbClient.query(text, params);
    const duration = Date.now() - start;
    console.log(`🕒 Query executed in ${duration}ms: ${text}`);
    return result;
  } catch (error) {
    console.error('❌ Query error:', text, error);
    throw error;
  }
}

/**
 * Closes the database connection.
 */
export async function closeDB() {
  if (client) {
    await client.end();
    client = null;
    console.log('🔒 Database connection closed');
  }
}
