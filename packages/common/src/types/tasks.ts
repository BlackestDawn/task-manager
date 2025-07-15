export interface TaskItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string | null;
  finishBy: Date | null;
  completed: boolean;
  completedAt: Date | null;
}

export interface CreateTaskRequest {
  title: string;
  description: string | null;
  finishBy: Date | null;
}

export interface UpdateTaskRequest {
  id: string;
  title: string;
  description: string | null;
  finishBy: Date | null;
}
