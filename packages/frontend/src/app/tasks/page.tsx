import { redirect } from "next/navigation";
import { checkAuthAction } from "@/lib/actions/auth";
import { getTasksAction } from "@/lib/actions/tasks";
import TasksCalendar from "@/components/tasks/tasksCalendar";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingSpinner from "@/components/general/loadingSpinner";

export const metadata: Metadata = {
  title: "Task Manager- Tasks",
  description: "Manage tasks"
}

export default async function TasksPage() {
  const { isAuthenticated } = await checkAuthAction();

  if (!isAuthenticated) redirect("/login?redirect=/tasks");

  const tasks = await getTasksAction();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TasksCalendar initialTasks={tasks} />
    </Suspense>
  );
}
