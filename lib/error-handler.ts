interface DbError extends Error {
  code?: string;
}

export function handleDatabaseError(error: unknown): { message: string; statusCode: number } {
  console.error('Database error:', error);
  
  if (!(error instanceof Error)) {
    return { message: 'An unknown error occurred', statusCode: 500 };
  }

  const dbError = error as DbError;
  
  switch (dbError.code) {
    case '23505':
      return { message: 'Booking conflict - this time slot may already be taken', statusCode: 409 };
    case '23502':
      return { message: 'Missing required fields', statusCode: 400 };
    case '22008':
    case '22007':
      return { message: 'Invalid date or time format', statusCode: 400 };
    case 'ECONNREFUSED':
    case 'ETIMEDOUT':
      return { message: 'Database connection failed', statusCode: 503 };
    default:
      return { 
        message: process.env.NODE_ENV === 'development' ? dbError.message : 'Internal server error',
        statusCode: 500 
      };
  }
}
