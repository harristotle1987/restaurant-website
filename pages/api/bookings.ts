import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../lib/db';

interface BookingData {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  guests: number;
  message?: string;
}

// Function to validate date format and value
const validateDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString + 'T00:00:00.000Z');
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    !isNaN(date.getTime())
  );
};

// Function to validate time format
const validateTime = (timeString: string): boolean => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeString);
};

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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['POST'],
    });
  }

  try {
    const bookingData = req.body as Partial<BookingData>;

    // Basic structure validation
    if (typeof bookingData !== 'object' || !bookingData) {
      return res.status(400).json({ error: 'Invalid request body format' });
    }

    const requiredFields: (keyof BookingData)[] = ['name', 'email', 'date', 'time', 'guests'];
    const missingFields = requiredFields.filter((field) => !bookingData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        requiredFields,
      });
    }

    const { name, email, phone, date, time, guests, message } = bookingData;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email!)) {
      return res.status(400).json({
        error: 'Invalid email format',
        details: 'Please provide a valid email address',
      });
    }

    if (!validateDate(date!)) {
      return res.status(400).json({
        error: 'Invalid date format',
        details: 'Please use YYYY-MM-DD format with a valid date',
      });
    }

    if (!validateTime(time!)) {
      return res.status(400).json({
        error: 'Invalid time format',
        details: 'Please use HH:MM format (24-hour)',
      });
    }

    if (typeof guests !== 'number' || guests < 1 || guests > 20) {
      return res.status(400).json({
        error: 'Invalid party size',
        details: 'Party size must be between 1 and 20',
      });
    }

    // Validate date is not in the past
    const bookingDate = new Date(date! + 'T00:00:00.000Z');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({
        error: 'Invalid booking date',
        details: 'Cannot book for past dates',
      });
    }

    // Test database connection
    if (!pool) {
      return res.status(503).json({
        error: 'Database connection not available',
      });
    }
    await pool.query('SELECT 1');

    // Insert booking into database
    const result = await pool.query(
      `INSERT INTO bookings (
        customer_name,
        customer_email,
        customer_phone,
        booking_date,
        booking_time,
        party_size,
        special_requests,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, booking_date, booking_time`,
      [
        name,
        email,
        phone || null,
        date,
        time,
        guests,
        message || null,
        'pending',
        new Date(),
        new Date(),
      ]
    );

    const booking = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: booking.id,
      bookingDetails: {
        date: booking.booking_date,
        time: booking.booking_time,
      },
    });

  } catch (error: any) {
    console.error('Booking API error:', error);

    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error.code === '23505') {
      statusCode = 409;
      errorMessage = 'Booking conflict - this time slot may already be taken';
    } else if (error.code === '23502') {
      statusCode = 400;
      errorMessage = 'Missing required database field';
    } else if (error.code === '22008' || error.code === '22007') {
      statusCode = 400;
      errorMessage = 'Invalid date or time format';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      statusCode = 503;
      errorMessage = 'Database connection failed';
    }

    return res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}