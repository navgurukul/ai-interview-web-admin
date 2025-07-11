import { NextResponse } from 'next/server';
import { sendTestInvitationEmail } from '../../lib/email'; // Import the email function
import { getUserById, User } from '../../lib/data'; // Import user functions and type
import { Test, CreateTestRequest } from '../../lib/api/test-api'; // Import Test type

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
    const requestBody = await request.json();
    const { user_ids, ...commonTestData } = requestBody as CreateTestRequest & { user_ids?: string[] };

    if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
      // Bulk test creation
      const results = [];
      let allSuccessful = true;

      for (const userId of user_ids) {
        const singleTestData = { ...commonTestData, user_id: userId };
        const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(singleTestData),
        });
        const data = await response.json();
        results.push({ userId, data, status: response.status });

        if (response.ok && data.code === '201') { // Assuming '201' is the success code
          const newTest = data.data as Test;
          if (newTest && newTest.user_id && newTest.activate_code) {
            const user = getUserById(newTest.user_id); // Fetch user details
            if (user && user.email) {
              try {
                await sendTestInvitationEmail(user, newTest);
                console.log(`Invitation email sent to ${user.email} for test ID ${newTest.test_id}`);
              } catch (emailError) {
                console.error(`Failed to send invitation email for test ID ${newTest.test_id} to user ${userId}:`, emailError);
                // Log email error but continue processing other users
              }
            } else {
              console.warn(`User not found or email missing for user ID ${newTest.user_id} (intended ${userId}). Email not sent.`);
            }
          } else {
            console.warn(`Test created for user ${userId}, but user_id or activate_code missing in response. Email not sent.`, newTest);
          }
        } else {
          allSuccessful = false;
          console.error(`Failed to create test for user ${userId}, backend response:`, data);
        }
      }

      if (allSuccessful) {
        return NextResponse.json(
          { code: '201', message: 'All tests created successfully', data: results.map(r => r.data.data) },
          { status: 201 }
        );
      } else {
        // Return a summary of successes and failures
        return NextResponse.json(
          { code: '207', message: 'Some tests failed to create', data: results },
          { status: 207 } // Multi-Status
        );
      }
    } else if (commonTestData.user_id) {
      // Single test creation (existing logic)
      const response = await fetch(`https://interview.ai.navgurukul.org/api/v1/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commonTestData), // commonTestData here includes user_id
      });
      const data = await response.json();

      if (response.ok && data.code === '201') {
        const newTest = data.data as Test;
        if (newTest && newTest.user_id && newTest.activate_code) {
          const user = getUserById(newTest.user_id);
          if (user && user.email) {
            try {
              await sendTestInvitationEmail(user, newTest);
              console.log(`Invitation email sent to ${user.email} for test ID ${newTest.test_id}`);
            } catch (emailError) {
              console.error(`Failed to send invitation email for test ID ${newTest.test_id}:`, emailError);
            }
          } else {
            console.warn(`User not found or email missing for user ID ${newTest.user_id}. Email not sent.`);
          }
        } else {
          console.warn('Test created, but user_id or activate_code missing. Email not sent.', newTest);
        }
      } else if (!response.ok) {
        console.error('Failed to create test, backend response:', data);
        return NextResponse.json(data, { status: response.status });
      }
      return NextResponse.json(data, { status: response.status });
    } else {
      // Invalid request body
      return NextResponse.json(
        { code: '400', message: 'Invalid request: must include user_id or user_ids array.', data: null },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Failed to create test(s) or send email:', error);
    return NextResponse.json(
      { code: '500', message: 'Failed to create test(s)', data: null },
      { status: 500 }
    );
  }
}