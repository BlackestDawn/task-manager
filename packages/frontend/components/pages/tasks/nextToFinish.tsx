import type { TaskItem } from "@task-manager/common";
import TaskCard from "./taskCard";

export default function ShowNextTaskToFinish({ task }: { task?: TaskItem }) {
  return (
    <div className="p-1">
      <h2>Next task to finish:</h2>
      <div className="flex justify-center max-w-[minmax(10rem, 30rem)] p-4">
        {task ? (<TaskCard task={task} />) : (
          <p>No tasks left with set finishing date.</p>
        )}
      </div>
    </div>
  );
}
