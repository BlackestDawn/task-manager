import { isThisMonth, sortByFinishDate } from "@task-manager/common";
import type { TaskItem } from "@task-manager/common";
import TaskGrid from "./taskGrid";

export default function TasksForThisMonth({ tasks }: { tasks: TaskItem[] }) {
  const tasksForThisWeek = tasks.filter((task) => isThisMonth(task));

  return (
    <div className="p-1">
      <hr className="p-1" />
      <h2>Tasks for This Month</h2>
      {tasksForThisWeek.length > 0 ? <TaskGrid tasks={tasksForThisWeek.sort(sortByFinishDate)} /> : (
        <p>No tasks set for completion this month.</p>
      )}
    </div>
  );
}
