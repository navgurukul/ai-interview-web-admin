import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    //const response = await fetch(`http://localhost:8000/api/v1/test/${params.id}`);
    const response = await fetch(`http://65.0.157.180/api/v1/test/${params.id}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to fetch test details', data: null },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const testData = await request.json();
   //const response = await fetch(`http://localhost:8000/api/v1/test/${params.id}`, {
    const response = await fetch(`http://65.0.157.180/api/v1/test/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to update test', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    //const response = await fetch(`http://localhost:8000/api/v1/test/${params.id}`, {
    const response = await fetch(`http://65.0.157.180/api/v1/test/${params.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { code: '500', message: 'Failed to delete test', data: null },
      { status: 500 }
    );
  }
} 