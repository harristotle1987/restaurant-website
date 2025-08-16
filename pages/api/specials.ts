// pages/api/specials.ts
import { Pool } from 'pg';
import type { NextApiRequest, NextApiResponse } from 'next';

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET'] 
    });
  }

  try {
    const client = await pool.connect();
    
    try {
      // Fetch active specials from the database
      const result = await client.query(
        `SELECT id, title, description, discount, 
                image_url AS "imageUrl", 
                TO_CHAR(valid_until, 'YYYY-MM-DD') AS "validUntil"
         FROM specials 
         WHERE is_active = TRUE 
         AND valid_until >= CURRENT_DATE
         ORDER BY created_at DESC`
      );
      
      return res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json(
      { error: 'Failed to fetch specials' }
    );
  }
}