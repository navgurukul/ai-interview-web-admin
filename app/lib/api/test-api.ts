import { ApiResponse, API_BASE_URL, languageMap, difficultyMap } from './api-types';
import { userApi } from './user-api';
import { testResultApi } from './test-result-api';
import * as nodemailer from 'nodemailer';

// Test status enum
export enum TestStatus {
  CREATED = "created",
  ACTIVATED = "activated",
  STARTED = "started",
  COMPLETED = "completed",
  EXPIRED = "expired"
}

// Test status mapping
export const testStatusMap: Record<string, string> = {
  'created': 'Created',
  'activated': 'Activated',
  'open': 'In Progress',
  'completed': 'Completed',
  'expired': 'Expired'
};

// Test type enum
export enum TestType {
  INTERVIEW = "interview",
  CODING = "coding",
  BEHAVIOR = "behavior"
}

// Test type mapping
export const testTypeMap: Record<string, string> = {
  'interview': 'Interview Test',
  'coding': 'Coding Test',
  'behavior': 'Behavior Test'
};

// Test type definition
export interface Test {
  test_id: string;
  activate_code: string;
  status: string;
  type: string;
  language: string;
  difficulty: string;
  job_id?: string;
  job_title?: string;
  user_id?: string;
  user_name?: string;
  question_ids: string[];
  examination_points: string[];
  test_time: number;
  create_date: string;
  start_date: string;
  expire_date: string;
  update_date?: string;
}

// Create test request type
export interface CreateTestRequest {
  job_id: string;
  user_id: string;
  type: string;
  language: string;
  difficulty: string;
  question_ids?: string[];
  examination_points?: string[];
  test_time: number;
  start_date: string;
  expire_date: string;
}

// Update test request type
export interface UpdateTestRequest {
  status?: string;
  type?: string;
  language?: string;
  difficulty?: string;
  job_id?: string;
  user_id?: string;
  question_ids?: string[];
  examination_points?: string[];
  test_time?: number;
  start_date?: string;
  expire_date?: string;
}

// Test API
export const testApi = {
  // Get test list
  async getTests(skip: number = 0, limit: number = 10): Promise<ApiResponse<Test[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch test list:', error);
      return { code: '500', message: 'Failed to fetch test list', data: null };
    }
  },

  // Get a single test
  async getTestById(testId: string): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test/${testId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch test details:', error);
      return { code: '500', message: 'Failed to fetch test details', data: null };
    }
  },

  // Create a test
  async createTest(testData: CreateTestRequest): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      const result = await response.json();

      if (result.code === '00000' && result.data) {
        const { user_id, activate_code } = result.data;
        if (user_id && activate_code) {
          try {
            const userResponse = await userApi.getUserById(user_id);
            if (userResponse.code === '00000' && userResponse.data && userResponse.data.email) {
              const userEmail = userResponse.data.email;
              const activationLink = `https://your-frontend-app.com/activate/${activate_code}`; // Placeholder URL

              const transporter = nodemailer.createTransport({
                host: 'smtp.example.com', // Placeholder
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: 'your-email@example.com', // Placeholder
                  pass: 'your-password', // Placeholder
                },
              });

              const mailOptions = {
                from: '"Your App Name" <your-email@example.com>', // Placeholder
                to: userEmail,
                subject: 'Activate Your Test',
                html: `
                  <p>Hello,</p>
                  <p>Thank you for creating a test. Please activate your test using the link below:</p>
                  <p><a href="${activationLink}">${activationLink}</a></p>
                  <p>Your activation code is: <strong>${activate_code}</strong></p>
                  <p>If you did not request this, please ignore this email.</p>
                `,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Error sending activation email:', error);
                } else {
                  console.log('Activation email sent:', info.response);
                }
              });
            } else if (userResponse.code !== '00000') {
              console.error('Failed to fetch user details for email:', userResponse.message);
            } else if (!userResponse.data || !userResponse.data.email) {
              console.warn('User data or email not found for user_id:', user_id);
            }
          } catch (emailError) {
            console.error('Error in email sending process:', emailError);
          }
        } else {
          console.warn('user_id or activate_code missing in createTest response, cannot send email.');
        }
      }
      return result;
    } catch (error) {
      console.error('Failed to create test:', error);
      return { code: '500', message: 'Failed to create test', data: null };
    }
  },

  // Update a test
  async updateTest(testId: string, testData: UpdateTestRequest): Promise<ApiResponse<Test>> {
    const intendedStatus = testData.status; // Store intended status
    try {
      const response = await fetch(`${API_BASE_URL}/test/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      const result = await response.json();

      if (intendedStatus === TestStatus.COMPLETED && result.code === '00000' && result.data) {
        const updatedTest = result.data;
        const userId = updatedTest.user_id;

        if (!userId) {
          console.warn('User ID not found in updated test data, cannot send completion email.', { testId });
        } else {
          try {
            console.log(`Attempting to send completion email for test ${testId} to user ${userId}`);
            const userResponse = await userApi.getUserById(userId);
            const testResultResponse = await testResultApi.getTestResult(testId);

            if (userResponse.code === '00000' && userResponse.data && userResponse.data.email &&
                testResultResponse.code === '00000' && testResultResponse.data) {

              const userEmail = userResponse.data.email;
              // Correctly map fields from TestResult interface
              const score = testResultResponse.data.score;
              const summary = testResultResponse.data.summary;
              const total_questions = testResultResponse.data.question_number; // Corrected mapping
              const correct_answers = testResultResponse.data.correct_number; // Corrected mapping
              const elapse_time_seconds = testResultResponse.data.elapse_time; // Corrected mapping
              const total_score = testResultResponse.data.total_score; // This was okay, maps to N/A if undefined

              const transporter = nodemailer.createTransport({
                host: 'smtp.example.com', // Placeholder
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: 'your-email@example.com', // Placeholder
                  pass: 'your-password', // Placeholder
                },
              });

              const mailOptions = {
                from: '"Your App Name" <your-email@example.com>', // Placeholder
                to: userEmail,
                subject: 'Your Test Results are Ready',
                html: `
                  <p>Hello,</p>
                  <p>You have completed your test. Here are your results:</p>
                  <p><strong>Score:</strong> ${score !== undefined ? score : 'N/A'}</p>
                  <p><strong>Summary:</strong> ${summary || 'No summary provided.'}</p>
                  <p><strong>Total Score:</strong> ${total_score !== undefined ? total_score : 'N/A'}</p>
                  <p><strong>Total Questions:</strong> ${total_questions !== undefined ? total_questions : 'N/A'}</p>
                  <p><strong>Correct Answers:</strong> ${correct_answers !== undefined ? correct_answers : 'N/A'}</p>
                  <p><strong>Time Spent:</strong> ${elapse_time_seconds !== undefined ? (elapse_time_seconds / 60).toFixed(2) + ' minutes' : 'N/A'}</p>
                  <p>Thank you for participating.</p>
                `,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error(`Error sending completion email for test ${testId}:`, error);
                } else {
                  console.log(`Completion email sent for test ${testId} to ${userEmail}:`, info.response);
                }
              });

            } else {
              if (userResponse.code !== '00000' || !userResponse.data || !userResponse.data.email) {
                console.warn(`Could not retrieve user email for test ${testId}. User API Response:`, userResponse);
              }
              if (testResultResponse.code !== '00000' || !testResultResponse.data) {
                console.warn(`Could not retrieve test results for test ${testId}. Test Result API Response:`, testResultResponse);
              }
            }
          } catch (emailProcessError) {
            console.error(`Error in completion email sending process for test ${testId}:`, emailProcessError);
          }
        }
      }
      return result;
    } catch (error) {
      console.error('Failed to update test:', error);
      return { code: '500', message: 'Failed to update test', data: null };
    }
  },

  // Delete a test
  async deleteTest(testId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test/${testId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete test:', error);
      return { code: '500', message: 'Failed to delete test', data: null };
    }
  },
};