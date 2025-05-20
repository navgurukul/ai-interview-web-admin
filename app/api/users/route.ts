import { NextResponse } from 'next/server';

// Proxy to the backend API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = searchParams.get('skip') || '0';
  const limit = searchParams.get('limit') || '10';
  
  try {
    const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/user?skip=${skip}&limit=${limit}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to fetch user list', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to create user', data: null },
      { status: 500 }
    );
  }
} 