import { NextResponse } from 'next/server';

const ZOHO_API_URL = 'https://ghar-dev.navgurukul.org/get/zoho/students';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoic3VyYWpzYWhhbmlAbmF2Z3VydWt1bC5vcmciLCJpYXQiOjE3NTIyNDQ0ODcsImV4cCI6MTc2MDAyMDQ4N30.GTcACuZ_zhAiZ8762qyTKDJbgJKPT7lSVenbjKjAGEg';
const PAGE_SIZE = 500; // The max_value per request

async function fetchAllStudents() {
  let allStudents: any[] = [];
  let minValue = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    const url = `${ZOHO_API_URL}?min_value=${minValue}&max_value=${minValue + PAGE_SIZE - 1}`;
    console.log(`Fetching from URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error fetching page with min_value ${minValue}: ${response.status} ${response.statusText}`, errorBody);
      // Stop fetching if one page fails
      throw new Error(`Failed to fetch student data: ${response.status} ${response.statusText}`);
    }

    const pageData = await response.json();

    if (pageData && Array.isArray(pageData.Data) && pageData.Data.length > 0) {
      allStudents = allStudents.concat(pageData.Data);
      minValue += PAGE_SIZE;
    } else {
      // No more data to fetch
      hasMoreData = false;
    }
  }

  return allStudents;
}

export async function GET(request: Request) {
  try {
    const allStudents = await fetchAllStudents();

    // Return the consolidated data in the same structure as the original API
    return NextResponse.json({
      Count: allStudents.length.toString(),
      Data: allStudents,
    });

  } catch (error) {
    console.error('Error in /api/ghar-students route:', error);
    // Return a structured error
    return NextResponse.json(
      { message: 'Internal server error while fetching student data.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
