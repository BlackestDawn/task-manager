import type { Task } from "@task-manager/common"
import { isTaskOverdue } from "@task-manager/common";
import { AlertTriangle, CheckSquare, Clock } from "lucide-react";

interface TaskStatusBadgeProps {
  task: Task;
}

export default function TaskStatusBadge({ task }: TaskStatusBadgeProps) {
  if (task.completed) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckSquare className="h-3 w-3 mr-1" />
        Completed
      </span>
    );
  }
  if (isTaskOverdue(task)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
      <Clock className="h-3 w-3 mr-1" />
      In Progress
    </span>
  );
}
