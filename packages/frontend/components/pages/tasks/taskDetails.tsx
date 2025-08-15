import type { TaskItem } from "@task-manager/common";
import { isTaskOverdue } from "@task-manager/common";

export default function TaskDetails({ task }: { task: TaskItem }) {
  return (
    <div className="">
      <h3 className={`${task.completed ? 'bg-green-400 dark:text-gray-600' : isTaskOverdue(task) ? 'bg-red-600' : ''}`}>{task.title}</h3>
      <p>{task.description}</p>
      <p>Due: {task.finishBy ? new Date(task.finishBy).toLocaleDateString() : "No due date set"}</p>
      <p>Status: {task.completed ? "Completed" : "Pending"}</p>
      <p>Created at: {`${new Date(task.createdAt).toLocaleDateString()}`}</p>
    </div>
  );
}
