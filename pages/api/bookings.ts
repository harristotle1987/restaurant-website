import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../lib/prisma"
import { z } from "zod"

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z.number().min(1, "At least 1 guest required").max(20, "Maximum 20 guests"),
  message: z.string().optional(),
})

interface DatabaseError extends Error {
  code?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    })
  }

  try {
    const validatedData = bookingSchema.parse(req.body)
    const { name, email, phone, date, time, guests, message } = validatedData

    let bookingDate: Date
    try {
      if (date.includes("T")) {
        bookingDate = new Date(date)
      } else {
        bookingDate = new Date(date + "T00:00:00.000Z")
      }
      if (isNaN(bookingDate.getTime())) {
        throw new Error("Invalid date")
      }
    } catch (dateError) {
      return res.status(400).json({
        error: "Invalid date format",
        details: "Please provide a valid date",
      })
    }

    let formattedTime: string
    try {
      if (time.includes("AM") || time.includes("PM")) {
        const [timePart, period] = time.split(" ")
        let [hours, minutes] = timePart.split(":").map(Number)
        if (period === "PM" && hours !== 12) {
          hours += 12
        } else if (period === "AM" && hours === 12) {
          hours = 0
        }
        formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      } else {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
        if (!timeRegex.test(time)) {
          throw new Error("Invalid time format")
        }
        formattedTime = time
      }
    } catch (timeError) {
      return res.status(400).json({
        error: "Invalid time format",
        details: "Please provide a valid time in HH:MM format or 12-hour format (e.g., 2:30 PM)",
      })
    }

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
    })

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
    })
  } catch (error) {
    console.error("❌ Booking API error:", error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.errors[0]?.message || "Validation failed",
        validationErrors: error.errors,
      })
    }

    // ✅ FIXED: Single variable declaration only
    const dbError = error as DatabaseError
    let statusCode = 500
    let responseMessage = "Internal server error"

    if (dbError.code) {
      switch (dbError.code) {
        case "P2002":
          statusCode = 409
          responseMessage = "Booking conflict - this time slot may already be taken"
          break
        case "P2003":
          statusCode = 400
          responseMessage = "Invalid reference data"
          break
        case "P2025":
          statusCode = 404
          responseMessage = "Record not found"
          break
        case "23505":
          statusCode = 409
          responseMessage = "Booking conflict - this time slot may already be taken"
          break
        case "23502":
          statusCode = 400
          responseMessage = "Missing required database field"
          break
        case "22008":
        case "22007":
          statusCode = 400
          responseMessage = "Invalid date or time format"
          break
        case "ECONNREFUSED":
        case "ETIMEDOUT":
          statusCode = 503
          responseMessage = "Database connection failed"
          break
        default:
          if (error instanceof Error) {
            responseMessage = error.message
          }
      }
    } else if (error instanceof Error) {
      responseMessage = error.message
    }

    return res.status(statusCode).json({
      error: responseMessage,
      details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    })
  }
}
