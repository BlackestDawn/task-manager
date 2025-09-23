import TaskGrid from "./taskGrid";
import type { TaskArrayProp } from "@/lib/data/interfaces/task";

export default function TasksForThisWeek({ tasks }: TaskArrayProp) {
  return (
    <div className="p-1">
      <h2>Tasks for This Week</h2>
      {tasks.length > 0 ? <TaskGrid tasks={tasks} /> : (
        <p>No tasks set for completion this week.</p>
      )}
    </div>
  );
}
