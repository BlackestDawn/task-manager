import ShowNextTaskToFinish from "@/components/pages/tasks/nextToFinish";
import TasksForThisWeek from "@/components/pages/tasks/tasksForThisWeek";
import TasksForThisMonth from "@/components/pages/tasks/tasksForThisMonth";
import type { Metadata } from "next";
import { fetchTasks } from "@/lib/api/task";
import { Suspense } from "react";
import type { TaskItem } from "@task-manager/common";
import { isThisMonth, isThisWeek, sortByFinishDate } from "@task-manager/common";

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
  const tasksForThisWeek = tasks.filter(task => isThisWeek(task));
  const tasksForThisMonth = tasks.filter(task => isThisMonth(task));
  const nextTask: TaskItem | undefined = tasks.filter(t => !t.completed && t.finishBy ).sort(sortByFinishDate)[0];

  return (
    <div>
      <h2>Tasks Page</h2>
      <p>This is the tasks page where you can see all and manage your tasks.</p>
      {/* Add more content or components related to tasks here */}
      <ShowNextTaskToFinish task={nextTask} />
      <TasksForThisWeek tasks={tasksForThisWeek} />
      <TasksForThisMonth tasks={tasksForThisMonth} />
    </div>
  );
}
