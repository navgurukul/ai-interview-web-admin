import { ApiResponse, API_BASE_URL } from './api-types';

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