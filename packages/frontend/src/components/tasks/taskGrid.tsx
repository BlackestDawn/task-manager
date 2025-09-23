import TaskCard from "./taskCard";
import type { TaskArrayProp } from "@/lib/data/interfaces/task";

export default function TaskGrid({ tasks }: TaskArrayProp) {
  return (
    <div className="p-4 grid grid-auto-rows-[auto 1fr auto] justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
    </div>
  )
}
