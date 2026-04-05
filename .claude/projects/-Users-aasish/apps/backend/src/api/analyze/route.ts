// POST /api/analyze - Run full analysis pipeline

import { NextRequest, NextResponse } from 'next/server';
import { runAnalysis } from '../../pipeline/analysis-router';

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Only allow HTTPS
    if (url.protocol !== 'https:') return false;
    // Block internal/private IPs
    const hostname = url.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.16.')) return false;
    if (hostname.endsWith('.local')) return false;
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { url, viewport } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL. Must be HTTPS and not an internal/private IP address.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Run analysis
    const result = await runAnalysis(url);

    // Calculate duration
    const durationMs = Date.now() - startTime;

    // Create response with duration header
    const response = NextResponse.json(result, {
      status: result.status === 'failed' ? 500 : 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Analysis-Duration': String(durationMs),
      },
    });

    return response;

  } catch (error) {
    const durationMs = Date.now() - startTime;
    
    console.error('Analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        message: (error as Error).message,
        durationMs,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
