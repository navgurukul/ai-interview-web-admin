// API Response Type
export interface PaginationMetadata {
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T | null;
  metadata?: PaginationMetadata;
}

// API Base URL

export const API_BASE_URL = 'https://interview.ai.navgurukul.org/api/v1';


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