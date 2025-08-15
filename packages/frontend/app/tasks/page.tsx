import ShowNextTaskToFinish from "@/components/pages/tasks/nextToFinish";
import TasksForThisWeek from "@/components/pages/tasks/tasksForThisWeek";
import TasksForThisMonth from "@/components/pages/tasks/tasksForThisMonth";
import TasksWithoutTimeLimit from "@/components/pages/tasks/tasksWithoutTimeLimit";
import type { Metadata } from "next";
import { fetchTasks } from "@/lib/api/task";
import { Suspense } from "react";
import type { TaskItem } from "@task-manager/common";
import { isThisMonth, isThisWeek, sortTasksByFinishDate } from "@task-manager/common";

export const metadata: Metadata = {
  title: 'Task Manager - Tasks',
  description: 'Displaying and manage tasks.',
};

export default async function TasksPageWrapper() {
  const tasks: TaskItem[] = await fetchTasks();

  return (
    <Suspense fallback={<div>Fetching tasks...</div>}>
      <TasksPage tasks={tasks} />
    </Suspense>
  );
}

function TasksPage({ tasks }: { tasks: TaskItem[] }) {
  const tasksForThisWeek = tasks.filter(task => isThisWeek(task.finishBy || '')).sort(sortTasksByFinishDate);
  const tasksForThisMonth = tasks.filter(task => isThisMonth(task.finishBy || '')).sort(sortTasksByFinishDate);
  const nonTimeboundTasks = tasks.filter(task => !task.finishBy);
  const nextTask: TaskItem | undefined =
    tasks.filter(t => !t.completed && t.finishBy ).sort(sortTasksByFinishDate)[0]
    || nonTimeboundTasks[0] || undefined;

  return (
    <div>
      <h2>Tasks Page</h2>
      <p>This is the tasks page where you can see all and manage your tasks.</p>
      {/* Add more content or components related to tasks here */}
      <hr className="py-1" />
      <ShowNextTaskToFinish task={nextTask} />
      <hr className="py-1" />
      <TasksForThisWeek tasks={tasksForThisWeek} />
      <hr className="py-1" />
      <TasksForThisMonth tasks={tasksForThisMonth} />
      <hr className="py-1" />
      <TasksWithoutTimeLimit tasks={nonTimeboundTasks} />
    </div>
  );
}
