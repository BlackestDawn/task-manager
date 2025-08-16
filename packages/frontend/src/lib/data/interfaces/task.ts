import type { TaskItem } from "@task-manager/common";

export interface TaskArrayProp {
  tasks: TaskItem[];
}

export interface TaskProp {
  task: TaskItem | undefined | null;
}

export interface TaskCardProp {
  task: TaskItem;
}
