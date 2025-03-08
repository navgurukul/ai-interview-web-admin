import { NextResponse } from 'next/server';

// 代理到后端API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = searchParams.get('skip') || '0';
  const limit = searchParams.get('limit') || '10';
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/question?skip=${skip}&limit=${limit}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: '获取题目列表失败', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const questionData = await request.json();
    const response = await fetch('http://localhost:8000/api/v1/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: '创建题目失败', data: null },
      { status: 500 }
    );
  }
} 