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
