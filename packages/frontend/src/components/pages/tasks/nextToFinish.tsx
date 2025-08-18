import TaskCard from "./taskCard";
import type { TaskProp } from "@/lib/data/interfaces/task";

export default function ShowNextTaskToFinish({ task }: TaskProp) {
  return (
    <div className="p-1">
      <h2>Recommended task to work on next:</h2>
      <div className="flex justify-center max-w-[minmax(10rem, 30rem)] p-4">
        {task ? (<TaskCard task={task} />) : (
          <p>No tasks found.</p>
        )}
      </div>
    </div>
  );
}
