import { testTasks } from "@/app/lib/data/mockData";
import type { TaskItem } from "@task-manager/common";
import { sortByFinishDate, justDate } from "@task-manager/common";

export default function GetNextTaskToFinish() {
  const nextTask: TaskItem | undefined = testTasks.filter(t => !t.completed && t.finishBy ).sort(sortByFinishDate)[0];

  return (
    <div>
      <h2>Next task to finish:</h2>
      {nextTask ? (
        <div>
          <h3 className="font-bold">Title: {nextTask.title}</h3>
          <p>Description: {nextTask.description}</p>
          <p>Finish by: {justDate(nextTask.finishBy || "")}</p>
          {/* Add more details or actions related to the next task here */}
        </div>
      ) : (
        <p>No tasks left with set finishing date.</p>
      )}
    </div>
  );
}
