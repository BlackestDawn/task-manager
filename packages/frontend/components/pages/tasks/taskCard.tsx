import { isOverdue } from "@task-manager/common";
import type { TaskItem } from "@task-manager/common";

export default function TaskCard({ task }: { task: TaskItem }) {
  return (
    <div className="grid grid-rows-subgrid row-span-3 border-2 border-gray-500 dark:border-gray-300 p-4 rounded-lg shadow-md">
      <h3 className={`${task.completed ? 'bg-green-400' : isOverdue(task) ? 'bg-red-600' : ''}`}>{task.title}</h3>
      <p>{task.description}</p>
      <p>Due: {task.finishBy ? new Date(task.finishBy).toLocaleDateString() : "No due date set"}</p>
    </div>
  );
}
