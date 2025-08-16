import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';

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

// Function to validate time format (HH:MM in 24-hour format)
const validateTime = (timeString: string): boolean => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeString);
};

// Function to validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface DatabaseError extends Error {
  code?: string;
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

  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ['POST']
    });
  }

  try {
    const {
      name,
      email,
      phone,
      date,
      time,
      guests,
      message
    } = req.body as BookingData;

    // Input validation
    if (!name || !email || !date || !time || guests === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Name, email, date, time, and guests are required"
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: "Please provide a valid email address"
      });
    }

    if (!validateDate(date)) {
      return res.status(400).json({
        error: "Invalid date format",
        details: "Please use YYYY-MM-DD format with a valid date"
      });
    }

    if (!validateTime(time)) {
      return res.status(400).json({
        error: "Invalid time format",
        details: "Please use HH:MM format (24-hour)"
      });
    }

    if (typeof guests !== "number" || guests < 1 || guests > 20) {
      return res.status(400).json({
        error: "Invalid party size",
        details: "Party size must be between 1 and 20"
      });
    }

    // Validate date is not in the past
    const bookingDate = new Date(date + 'T00:00:00.000Z');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        error: 'Invalid booking date',
        details: 'Cannot book for past dates',
      });
    }

    // Create booking in database using Prisma
    const booking = await prisma.booking.create({
      data: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,
        bookingDate: new Date(date),
        bookingTime: time,
        partySize: guests,
        specialRequests: message || null,
        status: 'pending'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: booking.id,
      bookingDetails: {
        date: booking.bookingDate,
        time: booking.bookingTime,
        guests: booking.partySize
      }
    });

  } catch (error) {
    console.error("Booking API error:", error);

    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (error instanceof Error) {
      const dbError = error as DatabaseError;

      switch (dbError.code) {
        case "P2002": // Prisma unique constraint violation
          statusCode = 409;
          errorMessage = "Booking conflict - this time slot may already be taken";
          break;
        case "P2003": // Foreign key constraint failed
          statusCode = 400;
          errorMessage = "Invalid reference data";
          break;
        case "P2025": // Record not found
          statusCode = 404;
          errorMessage = "Record not found";
          break;
        case "23505": // PostgreSQL unique violation
          statusCode = 409;
          errorMessage = "Booking conflict - this time slot may already be taken";
          break;
        case "23502": // PostgreSQL not null violation
          statusCode = 400;
          errorMessage = "Missing required database field";
          break;
        case "22008":
        case "22007": // PostgreSQL datetime format error
          statusCode = 400;
          errorMessage = "Invalid date or time format";
          break;
        case "ECONNREFUSED":
        case "ETIMEDOUT":
          statusCode = 503;
          errorMessage = "Database connection failed";
          break;
        default:
          if (dbError.message?.includes("Prisma")) {
            statusCode = 500;
            errorMessage = "Database operation failed";
          } else {
            errorMessage = dbError.message;
          }
      }
    }

    return res.status(statusCode).json({
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : undefined,
    });
  }
}
