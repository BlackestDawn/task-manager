import { testTasks } from "@/lib/data/mockData";
import type { TaskItem } from "@task-manager/common";
import { sortByFinishDate } from "@task-manager/common";
import TaskCard from "./taskCard";

export default function GetNextTaskToFinish() {
  const nextTask: TaskItem | undefined = testTasks.filter(t => !t.completed && t.finishBy ).sort(sortByFinishDate)[0];

  return (
    <div className="p-1">
      <hr className="p-1" />
      <h2>Next task to finish:</h2>
      <div className="flex justify-center max-w-[minmax(10rem, 30rem)]">
        {nextTask ? (<TaskCard task={nextTask} />) : (
          <p>No tasks left with set finishing date.</p>
        )}
      </div>
    </div>
  );
}
