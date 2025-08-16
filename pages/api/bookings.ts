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

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
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

// Function to validate phone number (optional)
const validatePhone = (phone?: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

interface DatabaseError extends Error {
  code?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
    if (!name || !email || !date || !time || !guests) {
      return res.status(400).json({
        error: "Missing required fields",
        details: { name, email, date, time, guests }
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!validateDate(date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    if (!validateTime(time)) {
      return res.status(400).json({ error: "Invalid time format. Use HH:MM (24-hour)" });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    if (typeof guests !== "number" || guests < 1 || guests > 20) {
      return res.status(400).json({ error: "Invalid number of guests (1-20)" });
    }

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        phone,
        date: new Date(date),
        time,
        guests,
        message: message || null
      }
    });

    return res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        name: booking.name,
        date: booking.date,
        time: booking.time,
        guests: booking.guests
      }
    });

  } catch (error) {
    console.error("Booking API error:", error);
    
    let statusCode = 500;
    let customErrorMessage = "Internal server error"; // Renamed variable
    
    if (error instanceof Error) {
      const dbError = error as DatabaseError;
      
      switch(dbError.code) {
        case "23505":
          statusCode = 409;
          customErrorMessage = "Booking conflict - this time slot may already be taken";
          break;
        case "23502":
          statusCode = 400;
          customErrorMessage = "Missing required database field";
          break;
        case "22008":
        case "22007":
          statusCode = 400;
          customErrorMessage = "Invalid date or time format";
          break;
        case "ECONNREFUSED":
        case "ETIMEDOUT":
          statusCode = 503;
          customErrorMessage = "Database connection failed";
          break;
      }
    }

    return res.status(statusCode).json({
      error: customErrorMessage, // Updated reference
      details: process.env.NODE_ENV === "development" ? 
        (error instanceof Error ? error.message : "Unknown error") : 
        undefined
    });
  }
}