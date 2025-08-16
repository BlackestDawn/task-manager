import TaskGrid from "./taskGrid";
import type { TaskArrayProp } from "@/lib/data/interfaces/task";

export default function TasksForThisMonth({ tasks }: TaskArrayProp) {
  return (
    <div className="p-1">
      <h2>Tasks for This Month</h2>
      {tasks.length > 0 ? <TaskGrid tasks={tasks} /> : (
        <p>No tasks set for completion this month.</p>
      )}
    </div>
  );
}
