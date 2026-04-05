// GET /api/health - Health check endpoint

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    gpuAvailable: process.env.HAS_GPU === 'true',
    timestamp: new Date().toISOString(),
  });
}
