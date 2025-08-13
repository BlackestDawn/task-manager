import { isThisWeek, sortByFinishDate } from "@task-manager/common";
import type { TaskItem } from "@task-manager/common";
import TaskGrid from "./taskGrid";

export default function TasksForThisWeek({ tasks }: { tasks: TaskItem[] }) {
  const tasksForThisWeek = tasks.filter((task) => isThisWeek(task));

  return (
    <div className="p-1">
      <hr className="p-1" />
      <h2>Tasks for This Week</h2>
      {tasksForThisWeek.length > 0 ? <TaskGrid tasks={tasksForThisWeek.sort(sortByFinishDate)} /> : (
        <p>No tasks set for completion this week.</p>
      )}
    </div>
  );
}
