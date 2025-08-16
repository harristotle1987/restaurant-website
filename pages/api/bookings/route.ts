import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'date', 'time', 'guests'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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

    return NextResponse.json(
      { success: true, bookingId: result.rows[0].id },
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Database error:', error);
    const message = error instanceof Error ? error.message : 'Database operation failed';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}