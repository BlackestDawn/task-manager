import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "./api";
import type { Task, UpdateTaskRequest } from "@task-manager/common";
import { TWO_MINUTES, FIVE_MINUTES } from "@/lib/data/consts";

export const TASK_KEYS = {
  all: ["task"] as const,
  lists: () => [...TASK_KEYS.all, "list"] as const,
  list: (filter: Record<string, unknown> = {}) => [...TASK_KEYS.lists(), filter] as const,
  userTasks: () => [...TASK_KEYS.lists(), "user"] as const,
  details: () => [...TASK_KEYS.lists(), "detail"] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const,
} as const;

export function useTasks() {
  return useQuery({
    queryKey: TASK_KEYS.userTasks(),
    queryFn: tasksApi.getUserTasks,
    staleTime: TWO_MINUTES,
  });
}

export function useTask(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => tasksApi.getTaskById(id),
    enabled: enabled && Boolean(id),
    staleTime: FIVE_MINUTES,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(TASK_KEYS.userTasks(), (old = []) => [...old, newTask]);
      queryClient.setQueryData(TASK_KEYS.detail(newTask.id), newTask);
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateTaskRequest> }) => tasksApi.updateTask(id, data),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(TASK_KEYS.detail(updatedTask.id), updatedTask);
      queryClient.setQueryData<Task[]>(TASK_KEYS.userTasks(), (old = []) =>
        old.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: (_, taskId) => {
      queryClient.setQueryData<Task[]>(TASK_KEYS.userTasks(), (old = []) =>
        old.filter(task => task.id !== taskId)
      );
      queryClient.removeQueries({ queryKey: TASK_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useMarkTaskDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.markTaskDone,
    onSuccess: (_, taskId) => {
      queryClient.setQueryData<Task>(TASK_KEYS.detail(taskId), (old) => {
        if (!old) return old;
        return { ...old, completed: true, completedAt: new Date(), };
      });
      queryClient.setQueryData<Task[]>(TASK_KEYS.userTasks(), (old = []) =>
        old.map(task => task.id === taskId ? { ...task, completed: true, completedAt: new Date() } : task)
      );

      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}
