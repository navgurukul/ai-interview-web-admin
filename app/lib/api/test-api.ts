import { ApiResponse, languageMap, difficultyMap } from './api-types';

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
      const response = await fetch(`http://65.0.157.180/api/v1/test?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch test list:', error);
      return { code: '500', message: 'Failed to fetch test list', data: null };
    }
  },

  // Get a single test
  async getTestById(testId: string): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`http://65.0.157.180/api/v1/test/${testId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch test details:', error);
      return { code: '500', message: 'Failed to fetch test details', data: null };
    }
  },

  // Create a test
  async createTest(testData: CreateTestRequest): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`http://65.0.157.180/api/v1/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create test:', error);
      return { code: '500', message: 'Failed to create test', data: null };
    }
  },

  // Update a test
  async updateTest(testId: string, testData: UpdateTestRequest): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`http://65.0.157.180/api/v1/test/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update test:', error);
      return { code: '500', message: 'Failed to update test', data: null };
    }
  },

  // Delete a test
  async deleteTest(testId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`http://65.0.157.180/api/v1/test/${testId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete test:', error);
      return { code: '500', message: 'Failed to delete test', data: null };
    }
  },
};