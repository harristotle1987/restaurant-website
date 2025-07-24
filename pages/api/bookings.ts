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
    const bookingData = req.body;
    
    // Server-side validation
    const requiredFields = ['name', 'email', 'date', 'time', 'guests'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO bookings (
        name, 
        email, 
        phone, 
        date, 
        time, 
        guests, 
        message,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id`,
      [
        bookingData.name,
        bookingData.email,
        bookingData.phone || null,
        bookingData.date,
        bookingData.time,
        bookingData.guests,
        bookingData.message || null
      ]
    );

    return res.status(201).json({ 
      success: true, 
      bookingId: result.rows[0].id 
    });
    
  } catch (error: any) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: error.message || 'Database operation failed' 
    });
  }
}