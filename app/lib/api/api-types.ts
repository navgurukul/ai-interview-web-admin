// API Response Type
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T | null;
}

// API Base URL


export const API_BASE_URL = 'https://interview.merakilearn.org/api/v1';


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