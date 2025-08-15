import { sortByFinishDate } from "@task-manager/common";
import type { TaskItem } from "@task-manager/common";
import TaskGrid from "./taskGrid";

export default function TasksForThisMonth({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="p-1">
      <hr className="p-1" />
      <h2>Tasks for This Month</h2>
      {tasks.length > 0 ? <TaskGrid tasks={tasks.sort(sortByFinishDate)} /> : (
        <p>No tasks set for completion this month.</p>
      )}
    </div>
  );
}
