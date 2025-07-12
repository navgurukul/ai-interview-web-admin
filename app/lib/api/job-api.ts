import { ApiResponse, API_BASE_URL } from './api-types';

// Job type definition
export interface Job {
  job_id: string;
  job_title: string;
  job_description: string;
  technical_skills: string[];
  soft_skills: string[];
  create_date: string;
}

// Create job request type
export interface CreateJobRequest {
  job_title: string;
  job_description: string;
  technical_skills: string[];
  soft_skills: string[];
}

// Update job request type
export interface UpdateJobRequest {
  job_title?: string;
  job_description?: string;
  technical_skills?: string[];
  soft_skills?: string[];
}

// Job API
export const jobApi = {
  // Get job list
  async getJobs(page: number = 1, pageSize: number = 1000): Promise<ApiResponse<Job[]>> {
    try {
      const skip = (page - 1) * pageSize;
      const response = await fetch(`${API_BASE_URL}/job?skip=${skip}&limit=${pageSize}`);
      // Mocking metadata as backend doesn't provide it for this endpoint
      const result: ApiResponse<Job[]> = await response.json();
      if (result.code === '0' && result.data) {
        const fetchedItemsCount = result.data.length;
        let total_count = skip + fetchedItemsCount;
        // A simplified mock pagination that assumes this is all the data
        result.metadata = {
          total_count: total_count,
          current_page: page,
          total_pages: page,
          has_next: false,
          has_previous: false,
        };
      }
      return result;
    } catch (error) {
      console.error('Failed to fetch job list:', error);
      return { code: '500', message: 'Failed to fetch job list', data: null };
    }
  },

  // Get a single job
  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      return { code: '500', message: 'Failed to fetch job details', data: null };
    }
  },
  
  // Create a job
  async createJob(jobData: CreateJobRequest): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create job:', error);
      return { code: '500', message: 'Failed to create job', data: null };
    }
  },
  
  // Update a job
  async updateJob(jobId: string, jobData: UpdateJobRequest): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update job:', error);
      return { code: '500', message: 'Failed to update job', data: null };
    }
  },

  // Delete a job
  async deleteJob(jobId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete job:', error);
      return { code: '500', message: 'Failed to delete job', data: null };
    }
  },
};