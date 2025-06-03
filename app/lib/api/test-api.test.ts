import { testApi, CreateTestRequest } from './test-api';
import { userApi } from './user-api'; // userApi is used internally by testApi
import * as nodemailer from 'nodemailer';
import { ApiResponse } from './api-types';
import { Test } from './test-api'; // Assuming Test interface is also in test-api.ts

// Mock global fetch
global.fetch = jest.fn();

// Mock nodemailer
const mockSendMail = jest.fn();
const mockCreateTransport = jest.spyOn(nodemailer, 'createTransport');

// Mock console methods
let consoleWarnSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

const mockTransporter = {
  sendMail: mockSendMail,
};

describe('testApi.createTest with email functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    mockCreateTransport.mockReturnValue(mockTransporter as any); // Ensure createTransport returns our mock transporter

    // Spy on console methods
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console spies
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const mockTestData: CreateTestRequest = {
    job_id: 'job123',
    user_id: 'user123',
    type: 'coding',
    language: 'javascript',
    difficulty: 'medium',
    test_time: 60,
    start_date: new Date().toISOString(),
    expire_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  const mockSuccessfulTestCreationResponse: ApiResponse<Test> = {
    code: '00000',
    message: 'Success',
    data: {
      test_id: 'testGeneratedId123',
      activate_code: 'activate123',
      user_id: 'user123',
      status: 'created',
      type: 'coding',
      language: 'javascript',
      difficulty: 'medium',
      question_ids: [],
      examination_points: [],
      test_time: 60,
      create_date: new Date().toISOString(),
      start_date: mockTestData.start_date,
      expire_date: mockTestData.expire_date,
    },
  };

  const mockUserApiResponse = (email: string | null = 'testuser@example.com'): ApiResponse<any> => ({
    code: '00000',
    message: 'Success',
    data: {
      user_id: 'user123',
      email: email,
      name: 'Test User',
    },
  });

  it('Scenario 1: should send an email successfully when a test is created and user is found', async () => {
    // Mock fetch for createTest
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessfulTestCreationResponse,
    });
    // Mock fetch for userApi.getUserById
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserApiResponse(),
    });

    const result = await testApi.createTest(mockTestData);

    expect(result).toEqual(mockSuccessfulTestCreationResponse);
    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'testuser@example.com',
        subject: 'Activate Your Test',
        html: expect.stringContaining('https://your-frontend-app.com/activate/activate123') &&
              expect.stringContaining('<strong>activate123</strong>'),
      }),
      expect.any(Function) // for the callback
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Scenario 2: should not send email if user_id or activate_code is missing from test creation response', async () => {
    const incompleteResponse: ApiResponse<Test> = {
      ...mockSuccessfulTestCreationResponse,
      data: {
        ...mockSuccessfulTestCreationResponse.data!,
        user_id: undefined, // or null
      },
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => incompleteResponse,
    });

    await testApi.createTest(mockTestData);

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith('user_id or activate_code missing in createTest response, cannot send email.');
  });

  it('Scenario 3a: should not send email if getUserById fails', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // createTest success
        ok: true,
        json: async () => mockSuccessfulTestCreationResponse,
      })
      .mockResolvedValueOnce({ // getUserById fails (network error or API error response)
        ok: false,
        status: 500,
        json: async () => ({ code: '500', message: 'Internal Server Error', data: null }),
      });
      // Or simulate userApi.getUserById returning a non-'00000' code
      // (fetch as jest.Mock).mockResolvedValueOnce({
      //   ok: true,
      //   json: async () => ({ code: 'E0001', message: 'User not found', data: null })
      // });


    await testApi.createTest(mockTestData);
    expect(mockSendMail).not.toHaveBeenCalled();
    // Depending on how userApi handles the non-ok response, the console message might vary.
    // If userApi.getUserById itself logs an error, that's fine.
    // The important part is that testApi.createTest logs that it couldn't get user details.
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch user details for email:', 'Internal Server Error');
  });

  it('Scenario 3b: should not send email if user has no email', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // createTest success
        ok: true,
        json: async () => mockSuccessfulTestCreationResponse,
      })
      .mockResolvedValueOnce({ // getUserById success but no email
        ok: true,
        json: async () => mockUserApiResponse(null),
      });

    await testApi.createTest(mockTestData);

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith('User data or email not found for user_id:', 'user123');
  });


  it('Scenario 4: should log error if sendMail itself fails', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // createTest success
        ok: true,
        json: async () => mockSuccessfulTestCreationResponse,
      })
      .mockResolvedValueOnce({ // getUserById success
        ok: true,
        json: async () => mockUserApiResponse(),
      });

    mockSendMail.mockImplementationOnce((options, callback) => {
      callback(new Error('SMTP server unavailable'), null);
    });

    const result = await testApi.createTest(mockTestData);

    expect(result).toEqual(mockSuccessfulTestCreationResponse); // Original response should still be returned
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending activation email:', expect.any(Error));
  });

  it('Scenario 5: should not attempt to send email if test creation fails initially', async () => {
    const errorResponse: ApiResponse<any> = {
      code: 'E1001',
      message: 'Failed to create test due to validation error',
      data: null,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true, // Or false, depending on how API errors are structured
      json: async () => errorResponse,
    });

    const result = await testApi.createTest(mockTestData);

    expect(result).toEqual(errorResponse);
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('Scenario 3c: should not send email if userApi.getUserById returns non-00000 code', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // createTest success
        ok: true,
        json: async () => mockSuccessfulTestCreationResponse,
      })
      .mockResolvedValueOnce({ // getUserById returns API error code
        ok: true,
        json: async () => ({ code: 'E0001', message: 'User not found by API', data: null }),
      });

    await testApi.createTest(mockTestData);
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch user details for email:', 'User not found by API');
  });

});

// Import TestStatus and UpdateTestRequest if not already imported at the top
import { TestStatus, UpdateTestRequest } from './test-api';
import { TestResult } from './test-result-api'; // Assuming TestResult interface is in test-result-api.ts

describe('testApi.updateTest with email functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTransport.mockReturnValue(mockTransporter as any);
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Log spy for general console.log, useful for debugging or specific info logs
    // consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // consoleLogSpy.mockRestore();
  });

  const testId = 'testId123';
  const mockUserId = 'userFromUpdateTest123';

  const mockUpdateTestData = (status: TestStatus): UpdateTestRequest => ({
    status: status,
  });

  const mockSuccessfulTestUpdateResponse = (userIdToReturn: string | undefined = mockUserId): ApiResponse<Test> => ({
    code: '00000',
    message: 'Test updated successfully',
    data: {
      test_id: testId,
      activate_code: 'activateUpdated123',
      user_id: userIdToReturn, // Crucial for fetching user email
      status: TestStatus.COMPLETED,
      type: 'coding',
      language: 'python',
      difficulty: 'hard',
      question_ids: ['q1', 'q2'],
      examination_points: ['p1', 'p2'],
      test_time: 120,
      create_date: new Date().toISOString(),
      start_date: new Date().toISOString(),
      expire_date: new Date().toISOString(),
      update_date: new Date().toISOString(),
    },
  });

  const mockUserDetailResponse = (email: string | null = 'completeduser@example.com'): ApiResponse<any> => ({
    code: '00000',
    message: 'User fetched successfully',
    data: {
      user_id: mockUserId,
      email: email,
      name: 'Completed Test User',
    },
  });

  const mockTestResultResponse = (
    score: number = 85,
    summary: string = 'Good performance',
    question_number: number = 10,
    correct_number: number = 8,
    elapse_time: number = 3600, // seconds
    total_score: number = 100
  ): ApiResponse<TestResult> => ({
    code: '00000',
    message: 'Test results fetched successfully',
    data: ({
      test_id: testId,
      user_id: mockUserId,
      score,
      summary,
      question_number, // Corrected field from TestResult
      correct_number,  // Corrected field from TestResult
      elapse_time,     // Corrected field from TestResult (seconds)
      total_score,
      create_date: new Date().toISOString(),
      update_date: new Date().toISOString(),
      details: [], // Assuming details are not strictly needed for email content
    } as TestResult), // Cast to TestResult to satisfy type checker if TestResult has more fields
  });


  it('Scenario 1: should send an email when test status is updated to COMPLETED', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockSuccessfulTestUpdateResponse() }) // Test Update
      .mockResolvedValueOnce({ ok: true, json: async () => mockUserDetailResponse() })         // User Fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockTestResultResponse() });       // Test Result Fetch

    const result = await testApi.updateTest(testId, mockUpdateTestData(TestStatus.COMPLETED));

    expect(result).toEqual(mockSuccessfulTestUpdateResponse());
    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'completeduser@example.com',
        subject: 'Your Test Results are Ready',
        html: expect.stringContaining('<strong>Score:</strong> 85') &&
              expect.stringContaining('<strong>Summary:</strong> Good performance') &&
              expect.stringContaining('<strong>Total Questions:</strong> 10') &&
              expect.stringContaining('<strong>Correct Answers:</strong> 8') &&
              expect.stringContaining('<strong>Time Spent:</strong> 60.00 minutes'), // 3600s / 60
      }),
      expect.any(Function)
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Scenario 2: should NOT send email if status is not COMPLETED', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockSuccessfulTestUpdateResponse() });

    await testApi.updateTest(testId, mockUpdateTestData(TestStatus.STARTED));
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('Scenario 3: should NOT send email if primary test update fails', async () => {
    const failedUpdateResponse = { code: 'E5000', message: 'Update failed', data: null };
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => failedUpdateResponse });

    const result = await testApi.updateTest(testId, mockUpdateTestData(TestStatus.COMPLETED));
    expect(result).toEqual(failedUpdateResponse);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('Scenario 4: should NOT send email if user_id is missing in test update response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockSuccessfulTestUpdateResponse(undefined) });

    await testApi.updateTest(testId, mockUpdateTestData(TestStatus.COMPLETED));
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith('User ID not found in updated test data, cannot send completion email.', { testId });
  });

  it('Scenario 5a: should NOT send email if userApi.getUserById fails (API error)', async () => {
    const userApiError = { code: 'E404', message: 'User not found', data: null };
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockSuccessfulTestUpdateResponse() }) // Test Update
      .mockResolvedValueOnce({ ok: true, json: async () => userApiError });                      // User Fetch fails

    await testApi.updateTest(testId, mockUpdateTestData(TestStatus.COMPLETED));
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(`Could not retrieve user email for test ${testId}. User API Response:`, userApiError);
  });

  it('Scenario 5b: should NOT send email if user has no email', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockSuccessfulTestUpdateResponse() }) // Test Update
      .mockResolvedValueOnce({ ok: true, json: async () => mockUserDetailResponse(null) });    // User Fetch, no email

    await testApi.updateTest(testId, mockUpdateTestData(TestStatus.COMPLETED));
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(`Could not retrieve user email for test ${testId}. User API Response:`, mockUserDetailResponse(null));
  });

  it('Scenario 6: should NOT send email if testResultApi.getTestResult fails', async () => {
    const testResultError = { code: 'E400', message: 'Results not available', data: null };
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockSuccessfulTestUpdateResponse() }) // Test Update
      .mockResolvedValueOnce({ ok: true, json: async () => mockUserDetailResponse() })         // User Fetch
      .mockResolvedValueOnce({ ok: true, json: async () => testResultError });                  // Test Result Fetch fails

    await testApi.updateTest(testId, mockUpdateTestData(TestStatus.COMPLETED));
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(`Could not retrieve test results for test ${testId}. Test Result API Response:`, testResultError);
  });

  it('Scenario 7: should log error if sendMail itself fails, but still return original response', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockSuccessfulTestUpdateResponse() }) // Test Update
      .mockResolvedValueOnce({ ok: true, json: async () => mockUserDetailResponse() })         // User Fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockTestResultResponse() });       // Test Result Fetch

    mockSendMail.mockImplementationOnce((options, callback) => {
      callback(new Error('SMTP server connection timed out'), null);
    });

    const result = await testApi.updateTest(testId, mockUpdateTestData(TestStatus.COMPLETED));
    expect(result).toEqual(mockSuccessfulTestUpdateResponse()); // Original response
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error sending completion email for test ${testId}:`, expect.any(Error));
  });
});
