// API Response Type
export interface ApiResponse<T> {
  code:string;
  message: string;
  data: T | null;
  total?: number;
}

// API Base URL - Configure this via the NEXT_PUBLIC_API_BASE_URL environment variable.
// Falls back to a local default (http://localhost:8000/api/v1) if the variable is not set.
// Example for .env.local: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
// Example for production: NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com/api/v1
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';


// Language Map
export const languageMap: Record<string, string> = {
  'Chinese': 'Chinese',
  'English': 'English'
};

// Difficulty Map
export const difficultyMap: Record<string, string> = {
  'easy': 'Easy',
  'medium': 'Medium',
  'hard': 'Hard'
};