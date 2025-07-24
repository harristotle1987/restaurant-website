import { Pool } from 'pg';
import type { NextApiRequest, NextApiResponse } from 'next';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const existing = await pool.query(
      'SELECT * FROM subscribers WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO subscribers (
        email, 
        subscribed_at
      ) VALUES ($1, $2) RETURNING id`,
      [email, new Date().toISOString()]
    );

    return res.status(201).json({ 
      success: true, 
      subscriberId: result.rows[0].id 
    });
    
  } catch (error: any) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: error.message || 'Database operation failed' 
    });
  }
}