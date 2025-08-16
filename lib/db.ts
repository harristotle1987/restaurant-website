import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Helper function to execute database queries with proper error handling
 */
export async function executeQuery<T>(
  operation: () => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const result = await operation();
    return { data: result };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, closing database connections...');
    await prisma.$disconnect();
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, closing database connections...');
    await prisma.$disconnect();
  });
}
