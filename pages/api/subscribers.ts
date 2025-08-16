import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../lib/prisma"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
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
    const { email } = subscribeSchema.parse(req.body)

    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(409).json({
          error: "Email already subscribed",
          subscriberId: existingSubscriber.id,
        })
      }

      const reactivatedSubscriber = await prisma.subscriber.update({
        where: { email },
        data: {
          isActive: true,
          unsubscribedAt: null,
        },
      })

      return res.status(200).json({
        success: true,
        message: "Subscription reactivated",
        subscriberId: reactivatedSubscriber.id,
      })
    }

    const newSubscriber = await prisma.subscriber.create({
      data: { email },
    })

    return res.status(201).json({
      success: true,
      subscriberId: newSubscriber.id,
      subscribedAt: newSubscriber.subscribedAt,
      message: "Successfully subscribed to newsletter",
    })
  } catch (error) {
    console.error("❌ Subscribers API error:", error)

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
          responseMessage = "Email already subscribed"
          break
        case "P2025":
          statusCode = 404
          responseMessage = "Record not found"
          break
        case "23505":
          statusCode = 409
          responseMessage = "Email already subscribed"
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
