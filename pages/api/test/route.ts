import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "API is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    dbUser: process.env.DB_USER ? "****" : "not set",
    dbHost: process.env.DB_HOST,
  });
}