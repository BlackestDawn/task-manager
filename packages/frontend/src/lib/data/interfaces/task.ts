import type { Task } from "@task-manager/common";

export interface TaskArrayProp {
  tasks: Task[];
}

export interface TaskProp {
  task: Task | undefined | null;
}

export interface TaskCardProp {
  task: Task;
}
