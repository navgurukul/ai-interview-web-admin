// API响应类型
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T | null;
}

// 用户类型定义
export interface User {
  user_id: string;
  user_name: string;
  staff_id: string;
  email: string;
  status: number; // 0: 激活, 1: 未激活
  role: number;   // 角色ID
  create_date: string;
}

// 创建用户请求类型
export interface CreateUserRequest {
  user_name: string;
  password: string;
  email: string;
  staff_id: string;
  role: number;
}

// 更新用户请求类型
export interface UpdateUserRequest {
  user_name?: string;
  email?: string;
  staff_id?: string;
  status?: number;
  role?: number;
}

// 职位类型定义
export interface Job {
  job_id: string;
  job_title: string;
  job_description: string;
  technical_skills: string[];
  soft_skills: string[];
  create_date: string;
}

// 创建职位请求类型
export interface CreateJobRequest {
  job_title: string;
  job_description: string;
  technical_skills: string[];
  soft_skills: string[];
}

// 更新职位请求类型
export interface UpdateJobRequest {
  job_title?: string;
  job_description?: string;
  technical_skills?: string[];
  soft_skills?: string[];
}

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

// API基础URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// 用户API
export const userApi = {
  // 获取用户列表
  async getUsers(skip: number = 0, limit: number = 10): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return { code: '500', message: '获取用户列表失败', data: null };
    }
  },

  // 获取单个用户
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('获取用户详情失败:', error);
      return { code: '500', message: '获取用户详情失败', data: null };
    }
  },

  // 创建用户
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('创建用户失败:', error);
      return { code: '500', message: '创建用户失败', data: null };
    }
  },

  // 更新用户
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新用户失败:', error);
      return { code: '500', message: '更新用户失败', data: null };
    }
  },

  // 删除用户
  async deleteUser(userId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('删除用户失败:', error);
      return { code: '500', message: '删除用户失败', data: null };
    }
  },
};

// 角色映射
export const roleMap: Record<number, string> = {
  0: '访客',
  1: '管理员',
  2: '普通用户',
};

// 状态映射
export const statusMap: Record<number, string> = {
  0: '激活',
  1: '未激活',
};

// 职位API
export const jobApi = {
  // 获取职位列表
  async getJobs(skip: number = 0, limit: number = 10): Promise<ApiResponse<Job[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('获取职位列表失败:', error);
      return { code: '500', message: '获取职位列表失败', data: null };
    }
  },

  // 获取单个职位
  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}`);
      return await response.json();
    } catch (error) {
      console.error('获取职位详情失败:', error);
      return { code: '500', message: '获取职位详情失败', data: null };
    }
  },

  // 创建职位
  async createJob(jobData: CreateJobRequest): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return await response.json();
    } catch (error) {
      console.error('创建职位失败:', error);
      return { code: '500', message: '创建职位失败', data: null };
    }
  },

  // 更新职位
  async updateJob(jobId: string, jobData: UpdateJobRequest): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return await response.json();
    } catch (error) {
      console.error('更新职位失败:', error);
      return { code: '500', message: '更新职位失败', data: null };
    }
  },

  // 删除职位
  async deleteJob(jobId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('删除职位失败:', error);
      return { code: '500', message: '删除职位失败', data: null };
    }
  },
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

// 题目难度映射
export const difficultyMap: Record<string, string> = {
  'easy': '简单',
  'medium': '中等',
  'hard': '困难'
};

// 题目类型映射
export const questionTypeMap: Record<string, string> = {
  'multiple_choice': '多选题',
  'single_choice': '单选题',
  'true_false': '判断题',
  'short_answer': '简答题',
  'essay': '论述题'
};

// 语言映射
export const languageMap: Record<string, string> = {
  'Chinese': '中文',
  'English': '英文'
}; 