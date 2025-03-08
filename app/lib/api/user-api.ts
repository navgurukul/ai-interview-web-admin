import { ApiResponse, API_BASE_URL } from './api-types';

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

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 0,
  INACTIVE = 1
}

// 用户状态映射
export const statusMap: Record<number, string> = {
  [UserStatus.ACTIVE]: '激活',
  [UserStatus.INACTIVE]: '未激活'
};

// 用户角色枚举
export enum UserRole {
  INTERVIEWER = 0,
  INTERVIEWEE = 1
}

// 用户角色映射
export const roleMap: Record<number, string> = {
  [UserRole.INTERVIEWER]: '面试官',
  [UserRole.INTERVIEWEE]: '面试者'
};

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