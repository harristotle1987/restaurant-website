import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeVersion: process.versions.node,
    nextRuntime: "edge" in process ? "edge" : "nodejs",
    environmentVariables: {
      DB_USER: process.env.DB_USER ? "****" : "not set",
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}