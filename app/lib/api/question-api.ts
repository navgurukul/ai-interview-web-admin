import { ApiResponse, API_BASE_URL, languageMap, difficultyMap } from './api-types';

// 题目类型定义
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

// 创建题目请求类型
export interface CreateQuestionRequest {
  question: string;
  answer: string;
  examination_points: string[];
  job_title: string;
  language: string;
  difficulty: string;
  type: string;
}

// 更新题目请求类型
export interface UpdateQuestionRequest {
  question?: string;
  answer?: string;
  examination_points?: string[];
  job_title?: string;
  language?: string;
  difficulty?: string;
  type?: string;
}

// 题目类型映射
export const questionTypeMap: Record<string, string> = {
  'multiple_choice': '多选题',
  'single_choice': '单选题',
  'true_false': '判断题',
  'short_answer': '简答题',
  'essay': '论述题'
};

// 题目API
export const questionApi = {
  // 获取题目列表
  async getQuestions(skip: number = 0, limit: number = 10): Promise<ApiResponse<Question[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('获取题目列表失败:', error);
      return { code: '500', message: '获取题目列表失败', data: null };
    }
  },

  // 获取单个题目
  async getQuestionById(questionId: string): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question/${questionId}`);
      return await response.json();
    } catch (error) {
      console.error('获取题目详情失败:', error);
      return { code: '500', message: '获取题目详情失败', data: null };
    }
  },

  // 创建题目
  async createQuestion(questionData: CreateQuestionRequest): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      return await response.json();
    } catch (error) {
      console.error('创建题目失败:', error);
      return { code: '500', message: '创建题目失败', data: null };
    }
  },

  // 更新题目
  async updateQuestion(questionId: string, questionData: UpdateQuestionRequest): Promise<ApiResponse<Question>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新题目失败:', error);
      return { code: '500', message: '更新题目失败', data: null };
    }
  },

  // 删除题目
  async deleteQuestion(questionId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/question/${questionId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('删除题目失败:', error);
      return { code: '500', message: '删除题目失败', data: null };
    }
  },
}; 