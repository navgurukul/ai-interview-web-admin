// Create Test Result API
import { ApiResponse, API_BASE_URL } from './api-types';

// Add TestResult interface definition

export interface TestResult {
  id: string;
  test_id: string;
  user_id: string;
  summary: string;
  score: number;
  question_number: number;
  correct_number: number;
  elapse_time: number;
  qa_history: {
    question: string;
    answer: string;
    summary: string;
  }[];
  created_at: string;
  updated_at: string;
} 

export const testResultApi = {
  // Fetch test result
  async getTestResult(testId: string): Promise<ApiResponse<TestResult>> {
  try {
    const response = await fetch(`${API_BASE_URL}/test_result/test/${testId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch test result:', error);
    return { code: '500', message: 'Failed to fetch test result', data: null };
  }
  }
};
