// Shared types for client-side code
export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  finish_by: string;
  completed_at: string;
}

export interface TaskItemCreateRequest {
  title: string;
  finish_by?: string;
}

export interface TaskItemUpdateRequest {
  id: string;
  title?: string;
  finish_by?: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
