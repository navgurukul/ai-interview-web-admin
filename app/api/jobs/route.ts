import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/lib/api/api-types';

// Proxy to backend API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = searchParams.get('skip') || '0';
  const limit = searchParams.get('limit') || '10';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/job?skip=${skip}&limit=${limit}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to fetch job list', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const jobData = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/v1/job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to create job', data: null },
      { status: 500 }
    );
  }
} 