import type { TaskItem } from "@task-manager/common";
// import { API_TASKS_ENDPOINT } from "@/lib/data/config";
import { testTasks } from "../data/mockData";

export async function fetchTasks(): Promise<TaskItem[]> {
  // const response = await fetch(API_TASKS_ENDPOINT);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch tasks');
  // }
  // return response.json();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(testTasks);
    }, 1000); // Simulate network delay
  });
}
