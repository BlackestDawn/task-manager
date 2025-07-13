export interface TaskItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description?: string;
  finishBy?: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  finishBy?: Date;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  finishBy?: Date;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: string;
}
