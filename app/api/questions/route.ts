import { NextResponse } from 'next/server';

// Proxy to the backend API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = searchParams.get('skip') || '0';
  const limit = searchParams.get('limit') || '10';
  
  try {
    const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/question?skip=${skip}&limit=${limit}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to fetch the question list', data: null },
      { status: 500 }
    );  
  }
}

export async function POST(request: Request) {
  try {
    const questionData = await request.json();
<<<<<<< HEAD
<<<<<<< HEAD
    const response = await fetch(`https://interview.merakilearn.org/api/v1//question`, {
=======
    const response = await fetch(`https://interview.merakilearn.org/api/v1/question`, {
>>>>>>> 4106674 (Fix API_BASE_URL)
=======
    const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/question`, {
>>>>>>> 0f471e0 (latest updated code (Working properlly in production))
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to create the question', data: null },
      { status: 500 }
    );
  }
} 