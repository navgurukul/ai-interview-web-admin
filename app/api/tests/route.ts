import { NextResponse } from 'next/server';
import { sendTestInvitationEmail } from '../../lib/email'; // Import the email function
import { getUserById, User } from '../../lib/data'; // Import user functions and type
import { Test } from '../../lib/api/test-api'; // Import Test type

// Proxy to backend API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = searchParams.get('skip') || '0';
  const limit = searchParams.get('limit') || '10';
  
  try {
    const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/test?skip=${skip}&limit=${limit}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch test list:', error); // Added console.error for logging
    return NextResponse.json(
      { code: '500', message: 'Failed to fetch test list', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const testData = await request.json();
    const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    const data = await response.json();

    // Check if the test was created successfully before sending email
    if (response.ok && data.code === '201') { // Assuming '201' is the success code from backend
      const newTest = data.data as Test; // Cast the response data to Test type
      if (newTest && newTest.user_id && newTest.activate_code) {
        const user = getUserById(newTest.user_id); // Fetch user details

        if (user && user.email) {
          try {
            await sendTestInvitationEmail(user, newTest);
            console.log(`Invitation email sent to ${user.email} for test ID ${newTest.test_id}`);
          } catch (emailError) {
            console.error(`Failed to send invitation email for test ID ${newTest.test_id}:`, emailError);
            // Do not block the response if email sending fails, but log the error.
          }
        } else {
          console.warn(`User not found or email missing for user ID ${newTest.user_id} for test ID ${newTest.test_id}. Email not sent.`);
        }
      } else {
        console.warn('Test created, but user_id or activate_code missing in the response. Email not sent.', newTest);
      }
    } else if (!response.ok) {
      // If the response status is not ok, log the error and return it.
      console.error('Failed to create test, backend response:', data);
      return NextResponse.json(data, { status: response.status });
    }
    // Return the original response from the test creation API
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Failed to create test or send email:', error); // Log the error
    return NextResponse.json(
      { code: '500', message: 'Failed to create test', data: null },
      { status: 500 }
    );
  }
}