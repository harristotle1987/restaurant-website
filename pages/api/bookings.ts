import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import rateLimit from "express-rate-limit";
import { NextApiHandler } from "next";

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many booking attempts, please try again later",
});

const applyRateLimit = (handler: NextApiHandler) => (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return new Promise<void>((resolve, reject) => {
    limiter(req as any, res as any, (err: unknown) => {
      if (err) return reject(err);
      Promise.resolve(handler(req, res)).then(() => resolve()).catch(reject);
    });
  });
};

// Zod schema for validation
const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z
    .number()
    .min(1, "At least 1 guest required")
    .max(20, "Maximum 20 guests"),
  message: z.string().optional(),
});

interface DatabaseError extends Error {
  code?: string;
}

// Helper function for date parsing
function parseBookingDate(dateString: string): Date {
  if (dateString.includes("T")) {
    return new Date(dateString);
  }
  return new Date(dateString + "T00:00:00.000Z");
}

// Helper function for time conversion
function convertTo24Hour(time: string): string {
  if (time.includes("AM") || time.includes("PM")) {
    const [timePart, period] = time.trim().split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    
    if (period === "AM" && hours === 12) {
      hours = 0; // 12AM becomes 00
    } else if (period === "PM" && hours < 12) {
      hours += 12; // Convert to 24-hour
    }
    
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  return time;
}

export default applyRateLimit(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
  }

  try {
    // Sanitize input data
    const sanitizedData = {
      ...req.body,
      name: DOMPurify.sanitize(req.body.name || ""),
      email: DOMPurify.sanitize(req.body.email || ""),
      phone: req.body.phone ? DOMPurify.sanitize(req.body.phone) : undefined,
      message: req.body.message
        ? DOMPurify.sanitize(req.body.message)
        : undefined,
    };

    // Validate input
    const validatedData = bookingSchema.parse(sanitizedData);
    const { name, email, phone, date, time, guests, message } = validatedData;

    // Parse and validate date
    let bookingDate: Date;
    try {
      bookingDate = parseBookingDate(date);
      if (isNaN(bookingDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (dateError) {
      return res.status(400).json({
        error: "Invalid date format",
        details: "Please provide a valid date (YYYY-MM-DD)",
      });
    }

    // Convert and validate time
    let formattedTime: string;
    try {
      formattedTime = convertTo24Hour(time);
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(formattedTime)) {
        throw new Error("Invalid time format");
      }
    } catch (timeError) {
      return res.status(400).json({
        error: "Invalid time format",
        details: "Please provide a valid time in HH:MM format or 12-hour format (e.g., 2:30 PM)",
      });
    }

    // Date range validation (past dates and max 3 months in future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxBookingDate = new Date();
    maxBookingDate.setMonth(today.getMonth() + 3);
    
    if (bookingDate < today) {
      return res.status(400).json({
        error: "Invalid booking date",
        details: "Cannot book for past dates",
      });
    }
    
    if (bookingDate > maxBookingDate) {
      return res.status(400).json({
        error: "Invalid booking date",
        details: "Bookings can only be made up to 3 months in advance",
      });
    }

    // Check for existing bookings at same time
    const existingBooking = await prisma.booking.findFirst({
      where: {
        bookingDate: bookingDate,
        bookingTime: formattedTime,
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        error: "Time slot unavailable",
        details: "This time is already booked. Please choose another time.",
      });
    }

    // Create new booking
    const newBooking = await prisma.booking.create({
      data: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,
        bookingDate: bookingDate,
        bookingTime: formattedTime,
        partySize: guests,
        specialRequests: message || null,
        status: "pending",
      },
    });

    // Enhanced logging
    console.log("✅ New booking created:", {
      id: newBooking.id,
      email: newBooking.customerEmail,
      date: newBooking.bookingDate.toISOString().split("T")[0],
      time: newBooking.bookingTime,
      ip: req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      bookingId: newBooking.id,
      message: "Booking created successfully",
      bookingDetails: {
        id: newBooking.id,
        name: newBooking.customerName,
        email: newBooking.customerEmail,
        date: newBooking.bookingDate,
        time: newBooking.bookingTime,
        guests: newBooking.partySize,
        status: newBooking.status,
      },
    });
  } catch (error) {
    // Enhanced error logging
    console.error("❌ Booking API error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as DatabaseError)?.code,
      body: req.body,
      ip: req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" && error instanceof Error 
        ? error.stack 
        : undefined,
    });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.errors[0]?.message || "Validation failed",
        validationErrors: error.errors,
      });
    }

    const dbError = error as DatabaseError;
    let statusCode = 500;
    let responseMessage = "Internal server error";

    // FIXED ERROR: Single variable declaration with proper scoping
    if (dbError.code) {
      switch (dbError.code) {
        case "P2002": // Prisma unique constraint
          statusCode = 409;
          responseMessage = "Booking conflict - this time slot may already be taken";
          break;
        case "P2003": // Foreign key constraint
          statusCode = 400;
          responseMessage = "Invalid reference data";
          break;
        case "P2025": // Record not found
          statusCode = 404;
          responseMessage = "Record not found";
          break;
        case "23505": // PostgreSQL unique violation
          statusCode = 409;
          responseMessage = "Booking conflict - this time slot may already be taken";
          break;
        case "23502": // PostgreSQL not null violation
          statusCode = 400;
          responseMessage = "Missing required database field";
          break;
        case "22008":
        case "22007": // Date/time error
          statusCode = 400;
          responseMessage = "Invalid date or time format";
          break;
        case "ECONNREFUSED":
        case "ETIMEDOUT":
          statusCode = 503;
          responseMessage = "Database connection failed";
          break;
        default:
          if (error instanceof Error) {
            responseMessage = error.message;
          }
      }
    } else if (error instanceof Error) {
      responseMessage = error.message;
    }

    return res.status(statusCode).json({
      error: responseMessage,
      details:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  }
});