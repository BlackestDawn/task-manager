import TaskGrid from "./taskGrid";
import type { TaskArrayProp } from "@/lib/data/interfaces/task";

export default function TasksWithoutTimeLimit({ tasks }: TaskArrayProp) {
  return (
    <div className="p-1">
      <h2>Tasks Without Time Limit</h2>
      {tasks.length > 0 ? <TaskGrid tasks={tasks} /> : (
        <p>No tasks found.</p>
      )}
    </div>
  );
}
