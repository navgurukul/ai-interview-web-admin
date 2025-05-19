import { ApiResponse, API_BASE_URL, languageMap, difficultyMap } from './api-types';

// Question type definition
export interface Question {
  question_id: string;
  question: string;
  answer: string;
  examination_points: string[];
  job_title: string;
  language: string;
  difficulty: string;
  type: string;
}

// Create question request type
export interface CreateQuestionRequest {
  question: string;
  answer: string;
  examination_points: string[];
  job_title: string;
  language: string;
  difficulty: string;
  type: string;
}

// Update question request type
export interface UpdateQuestionRequest {
  question?: string;
  answer?: string;
  examination_points?: string[];
  job_title?: string;
  language?: string;
  difficulty?: string;
  type?: string;
}

// Question type mapping
export const questionTypeMap: Record<string, string> = {
  'multiple_choice': 'Multiple Choice',
  'single_choice': 'Single Choice',
  'true_false': 'True/False',
  'short_answer': 'Short Answer',
  'essay': 'Essay'
};

// Question API
export const questionApi = {
  // Get question list
  async getQuestions(skip: number = 0, limit: number = 10): Promise<ApiResponse<Question[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch question list:', error);
      return { code: '500', message: 'Failed to fetch question list', data: null };
    }
  },

  // Get a single question
  async getQuestionById(questionId: string): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question/${questionId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch question details:', error);
      return { code: '500', message: 'Failed to fetch question details', data: null };
    }
  },

  // Create a question
  async createQuestion(questionData: CreateQuestionRequest): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create question:', error);
      return { code: '500', message: 'Failed to create question', data: null };
    }
  },

  // Update a question
  async updateQuestion(questionId: string, questionData: UpdateQuestionRequest): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update question:', error);
      return { code: '500', message: 'Failed to update question', data: null };
    }
  },

  // Delete a question
  async deleteQuestion(questionId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question/${questionId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete question:', error);
      return { code: '500', message: 'Failed to delete question', data: null };
    }
  },
};