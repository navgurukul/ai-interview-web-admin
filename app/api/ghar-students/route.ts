import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'https://ghar-dev.navgurukul.org/get/zoho/students?min_value=1&max_value=500';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoic3VyYWpzYWhhbmlAbmF2Z3VydWt1bC5vcmciLCJpYXQiOjE3NTIyNDQ0ODcsImV4cCI6MTc2MDAyMDQ4N30.GTcACuZ_zhAiZ8762qyTKDJbgJKPT7lSVenbjKjAGEg';

export async function GET(request: Request) {
  try {
    const response = await fetch(EXTERNAL_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
      // It's good practice to consider caching strategies for external API calls
      // cache: 'no-store', // or 'force-cache', or revalidate options
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('External API Error Body:', errorBody);
      // Return a structured error that the client can understand
      return NextResponse.json(
        { message: `Error fetching data from Ghar API: ${response.status} ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/ghar-students route:', error);
    // Return a structured error
    return NextResponse.json(
      { message: 'Internal server error while fetching student data.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
