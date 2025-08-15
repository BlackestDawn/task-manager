import TaskGrid from "./taskGrid";
import type { TaskItem } from "@task-manager/common";

export default function TasksWithoutTimeLimit({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="p-1">
      <hr className="p-1" />
      <h2>Tasks Without Time Limit</h2>
      {tasks.length > 0 ? <TaskGrid tasks={tasks} /> : (
        <p>No tasks found.</p>
      )}
    </div>
  );
}
