import { createMocks } from "node-mocks-http"
import handler from "../../pages/api/bookings"
import { prisma } from "../../lib/prisma"
import jest from "jest"

// Mock the Prisma client
jest.mock("../../lib/prisma", () => ({
  prisma: {
    booking: {
      create: jest.fn(),
    },
  },
}))

const mockedPrisma = prisma as jest.Mocked<typeof prisma>

describe("/api/bookings", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 405 for non-POST requests", async () => {
    const { req, res } = createMocks({
      method: "GET",
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    })
  })

  it("validates required fields with Zod", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "", // Empty name should fail validation
        email: "invalid-email", // Invalid email format
        date: "",
        time: "",
        guests: 0, // Invalid guest count
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toBe("Invalid input")
    expect(responseData.validationErrors).toBeDefined()
  })

  it("validates email format", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "invalid-email-format",
        date: "2025-12-25",
        time: "18:00",
        guests: 4,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toBe("Invalid input")
    expect(responseData.details).toContain("Invalid email address")
  })

  it("validates guest count limits", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "john@example.com",
        date: "2025-12-25",
        time: "18:00",
        guests: 25, // Exceeds maximum of 20
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toBe("Invalid input")
    expect(responseData.details).toContain("Maximum 20 guests")
  })

  it("handles invalid date format", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "john@example.com",
        date: "invalid-date",
        time: "18:00",
        guests: 4,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toBe("Invalid date format")
  })

  it("handles invalid time format", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "john@example.com",
        date: "2025-12-25",
        time: "25:00", // Invalid time
        guests: 4,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toBe("Invalid time format")
  })

  it("converts 12-hour time format to 24-hour", async () => {
    const mockBooking = {
      id: 1,
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: null,
      bookingDate: new Date("2025-12-25"),
      bookingTime: "18:00", // Should be converted from 6:00 PM
      partySize: 4,
      specialRequests: null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockedPrisma.booking.create.mockResolvedValueOnce(mockBooking)

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "john@example.com",
        date: "2025-12-25",
        time: "6:00 PM", // 12-hour format
        guests: 4,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    expect(mockedPrisma.booking.create).toHaveBeenCalledWith({
      data: {
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: null,
        bookingDate: new Date("2025-12-25T00:00:00.000Z"),
        bookingTime: "18:00",
        partySize: 4,
        specialRequests: null,
        status: "pending",
      },
    })
  })

  it("creates a booking successfully with all fields", async () => {
    const mockBooking = {
      id: 1,
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+1234567890",
      bookingDate: new Date("2025-12-25"),
      bookingTime: "18:00",
      partySize: 4,
      specialRequests: "Window seat please",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockedPrisma.booking.create.mockResolvedValueOnce(mockBooking)

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        date: "2025-12-25",
        time: "18:00",
        guests: 4,
        message: "Window seat please",
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const responseData = JSON.parse(res._getData())

    expect(responseData).toMatchObject({
      success: true,
      message: "Booking created successfully",
      bookingId: 1,
      bookingDetails: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        guests: 4,
        status: "pending",
      },
    })

    expect(mockedPrisma.booking.create).toHaveBeenCalledWith({
      data: {
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+1234567890",
        bookingDate: new Date("2025-12-25T00:00:00.000Z"),
        bookingTime: "18:00",
        partySize: 4,
        specialRequests: "Window seat please",
        status: "pending",
      },
    })
  })

  it("creates a booking successfully with minimal fields", async () => {
    const mockBooking = {
      id: 2,
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      customerPhone: null,
      bookingDate: new Date("2025-12-30"),
      bookingTime: "19:30",
      partySize: 2,
      specialRequests: null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockedPrisma.booking.create.mockResolvedValueOnce(mockBooking)

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "Jane Smith",
        email: "jane@example.com",
        date: "2025-12-30",
        time: "19:30",
        guests: 2,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const responseData = JSON.parse(res._getData())

    expect(responseData.success).toBe(true)
    expect(responseData.bookingId).toBe(2)
    expect(responseData.bookingDetails.name).toBe("Jane Smith")
  })

  it("handles database errors gracefully", async () => {
    const dbError = new Error("Database connection failed")
    ;(dbError as any).code = "ECONNREFUSED"

    mockedPrisma.booking.create.mockRejectedValueOnce(dbError)

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "john@example.com",
        date: "2025-12-25",
        time: "18:00",
        guests: 4,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(503)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toBe("Database connection failed")
  })

  it("handles Prisma unique constraint violations", async () => {
    const prismaError = new Error("Unique constraint failed")
    ;(prismaError as any).code = "P2002"

    mockedPrisma.booking.create.mockRejectedValueOnce(prismaError)

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "John Doe",
        email: "john@example.com",
        date: "2025-12-25",
        time: "18:00",
        guests: 4,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(409)
    const responseData = JSON.parse(res._getData())
    expect(responseData.error).toBe("Booking conflict - this time slot may already be taken")
  })
})

