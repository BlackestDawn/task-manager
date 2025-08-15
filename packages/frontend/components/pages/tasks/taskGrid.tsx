import type { TaskItem } from "@task-manager/common";
import TaskCard from "./taskCard";

export default function TaskGrid({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="grid grid-auto-rows-[auto 1fr auto] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
    </div>
  )
}
