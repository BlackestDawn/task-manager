import DashboardStats from "@/components/dashboard/dashboardStats";
import DashboardTaskSections from "@/components/dashboard/dashboardTaskSections";
import type { Metadata } from "next";
import { fetchTasks } from "@/lib/api/task";
import { Suspense } from "react";
import type { Task } from "@task-manager/common";
import { isThisMonth, isThisWeek, sortTasksByFinishDate } from "@task-manager/common";
import ProtectedRoute from "@/components/auth/protectedRoute";
import { CardSkeleton } from "@/components/general/loadingSkeletons";

export const metadata: Metadata = {
  title: 'Task Manager - Dashboard',
  description: 'Dashboard overview of tasks and activities.',
};

export default async function DashboardPageWrapper() {
  const tasks: Task[] = await fetchTasks();

  return (
    <ProtectedRoute>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPage tasks={tasks} />
      </Suspense>
    </ProtectedRoute>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <CardSkeleton count={6} />
    </div>
  );
}

interface DashboardPageProps {
  tasks: Task[];
}

function DashboardPage({ tasks }: DashboardPageProps) {
  const tasksForThisWeek = tasks.filter(task => isThisWeek(task.finishBy || '')).sort(sortTasksByFinishDate);
  const tasksForThisMonth = tasks.filter(task => isThisMonth(task.finishBy || '')).sort(sortTasksByFinishDate);
  const nonTimeboundTasks = tasks.filter(task => !task.finishBy);
  const completedTasks = tasks.filter(task => task.completed);
  const overdueTasks = tasks.filter(task => !task.completed && task.finishBy && new Date(task.finishBy) < new Date());
  const nextTask: Task | undefined =
    tasks.filter(t => !t.completed && t.finishBy).sort(sortTasksByFinishDate)[0]
    || nonTimeboundTasks[0] || undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your tasks and productivity
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        totalTasks={tasks.length}
        completedTasks={completedTasks.length}
        overdueTasks={overdueTasks.length}
        upcomingTasks={tasksForThisWeek.length}
      />

      {/* Task Sections */}
      <DashboardTaskSections
        nextTask={nextTask}
        tasksForThisWeek={tasksForThisWeek}
        tasksForThisMonth={tasksForThisMonth}
        nonTimeboundTasks={nonTimeboundTasks}
        overdueTasks={overdueTasks}
      />
    </div>
  );
}
