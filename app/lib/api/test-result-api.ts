// 创建测试结果 API
import { ApiResponse, API_BASE_URL } from './api-types';


// 添加 TestResult 接口定义

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
  // 获取测试结果
  async getTestResult(testId: string): Promise<ApiResponse<TestResult>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test_result/test/${testId}`);
      return await response.json();
    } catch (error) {
      console.error('获取测试结果失败:', error);
      return { code: '500', message: '获取测试结果失败', data: null };
    }
  }
};
  