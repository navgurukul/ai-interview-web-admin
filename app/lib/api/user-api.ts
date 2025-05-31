import { ApiResponse, API_BASE_URL } from './api-types';

// User type definition
export interface User {
  user_id: string;
  user_name: string;
  staff_id: string;
  email: string;
  status: number; // 0: Active, 1: Inactive
  role: number;   // Role ID
  create_date: string;
}

// Create user request type
export interface CreateUserRequest {
  user_name: string;
  password: string;
  email: string;
  staff_id: string;
  role: number;
}

// Update user request type
export interface UpdateUserRequest {
  user_name?: string;
  email?: string;
  staff_id?: string;
  status?: number;
  role?: number;
}

// User status enum
export enum UserStatus {
  ACTIVE = 0,
  INACTIVE = 1
}

// User status mapping
export const statusMap: Record<number, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.INACTIVE]: 'Inactive'
};

// User role enum
export enum UserRole {
  INTERVIEWER = 0,
  INTERVIEWEE = 1
}

// User role mapping
export const roleMap: Record<number, string> = {
  [UserRole.INTERVIEWER]: 'Interviewer',
  [UserRole.INTERVIEWEE]: 'Interviewee'
};

// User API
export const userApi = {
  // Get user list
  // The backend API endpoint /api/v1/user (or its actual implementation)
  // must return a `total: number` field in the JSON response object,
  // representing the total number of users, for pagination to work correctly.
  async getUsers(skip: number = 0, limit: number = 10): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user?skip=${skip}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user list:', error);
      return { code: '500', message: 'Failed to fetch user list', data: null, total: 0 };
    }
  },

  // Get single user
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      return { code: '500', message: 'Failed to fetch user details', data: null };
    }
  },

  // Create user
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create user:', error);
      return { code: '500', message: 'Failed to create user', data: null };
    }
  },

  // Update user
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update user:', error);
      return { code: '500', message: 'Failed to update user', data: null };
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { code: '500', message: 'Failed to delete user', data: null };
    }
  },
};