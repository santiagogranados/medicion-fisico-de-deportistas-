import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0',
      uptime: process.uptime(),
    },
  });
}
