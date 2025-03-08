import { ApiResponse, API_BASE_URL, languageMap, difficultyMap } from './api-types';

// 测试状态枚举
export enum TestStatus {
  CREATED = "created",
  ACTIVATED = "activated",
  STARTED = "started",
  COMPLETED = "completed",
  EXPIRED = "expired"
}

// 测试状态映射
export const testStatusMap: Record<string, string> = {
  'created': '已创建',
  'activated': '已激活',
  'started': '进行中',
  'completed': '已完成',
  'expired': '已过期'
};

// 测试类型枚举
export enum TestType {
  INTERVIEW = "interview",
  CODING = "coding",
  BEHAVIOR = "behavior"
}

// 测试类型映射
export const testTypeMap: Record<string, string> = {
  'interview': '面试测试',
  'coding': '编程测试',
  'behavior': '行为测试'
};

// 测试类型定义
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

// 创建测试请求类型
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

// 更新测试请求类型
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

// 测试API
export const testApi = {
  // 获取测试列表
  async getTests(skip: number = 0, limit: number = 10): Promise<ApiResponse<Test[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('获取测试列表失败:', error);
      return { code: '500', message: '获取测试列表失败', data: null };
    }
  },

  // 获取单个测试
  async getTestById(testId: string): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test/${testId}`);
      return await response.json();
    } catch (error) {
      console.error('获取测试详情失败:', error);
      return { code: '500', message: '获取测试详情失败', data: null };
    }
  },

  // 创建测试
  async createTest(testData: CreateTestRequest): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      return await response.json();
    } catch (error) {
      console.error('创建测试失败:', error);
      return { code: '500', message: '创建测试失败', data: null };
    }
  },

  // 更新测试
  async updateTest(testId: string, testData: UpdateTestRequest): Promise<ApiResponse<Test>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新测试失败:', error);
      return { code: '500', message: '更新测试失败', data: null };
    }
  },

  // 删除测试
  async deleteTest(testId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/test/${testId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('删除测试失败:', error);
      return { code: '500', message: '删除测试失败', data: null };
    }
  },
}; 