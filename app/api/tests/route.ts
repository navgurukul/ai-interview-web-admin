import { NextResponse } from 'next/server';

// Proxy to backend API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = searchParams.get('skip') || '0';
  const limit = searchParams.get('limit') || '10';
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/test?skip=${skip}&limit=${limit}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to fetch test list', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const testData = await request.json();
    const response = await fetch('http://localhost:8000/api/v1/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to create test', data: null },
      { status: 500 }
    );
  }
} 