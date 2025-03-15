// API响应类型
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T | null;
}

// API基础URL
export const API_BASE_URL = 'http://localhost:8000/api/v1';

// 语言映射
export const languageMap: Record<string, string> = {
  'Chinese': '中文',
  'English': '英文'
};

// 难度映射
export const difficultyMap: Record<string, string> = {
  'easy': '简单',
  'medium': '中等',
  'hard': '困难'
};