import ShowNextTaskToFinish from "@/components/tasks/nextToFinish";
import TasksForThisWeek from "@/components/tasks/tasksForThisWeek";
import TasksForThisMonth from "@/components/tasks/tasksForThisMonth";
import TasksWithoutTimeLimit from "@/components/tasks/tasksWithoutTimeLimit";
import type { Metadata } from "next";
import { fetchTasks } from "@/lib/api/task";
import { Suspense } from "react";
import type { Task } from "@task-manager/common";
import { isThisMonth, isThisWeek, sortTasksByFinishDate } from "@task-manager/common";
import type { TaskArrayProp } from "@/lib/data/interfaces/task";
import ProtectedRoute from "@/components/auth/protectedRoute";
import { CardSkeleton } from "@/components/general/loadingSkeletons";
import { CheckSquare, Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Task Manager - Tasks',
  description: 'Displaying and manage tasks.',
};

export default async function TasksPageWrapper() {
  const tasks: Task[] = await fetchTasks();

  return (
    <ProtectedRoute>
      <Suspense fallback={<div>{<TasksPageSkeleton />}</div>}>
        <TasksPage tasks={tasks} />
      </Suspense>
    </ProtectedRoute>
  );
}

function TasksPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-8">
        <CardSkeleton count={1} />
        <CardSkeleton count={3} />
        <CardSkeleton count={3} />
        <CardSkeleton count={3} />
      </div>
    </div>
  );
}

function TasksPage({ tasks }: TaskArrayProp) {
  const tasksForThisWeek = tasks.filter(task => isThisWeek(task.finishBy || '')).sort(sortTasksByFinishDate);
  const tasksForThisMonth = tasks.filter(task => isThisMonth(task.finishBy || '')).sort(sortTasksByFinishDate);
  const nonTimeboundTasks = tasks.filter(task => !task.finishBy);
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const nextTask: Task | undefined =
    tasks.filter(t => !t.completed && t.finishBy).sort(sortTasksByFinishDate)[0]
    || nonTimeboundTasks[0] || undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tasks
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and organize your tasks efficiently
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{tasks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{completedTasks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{pendingTasks.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Sections */}
      <div className="space-y-8">
        <ShowNextTaskToFinish task={nextTask} />
        <TasksForThisWeek tasks={tasksForThisWeek} />
        <TasksForThisMonth tasks={tasksForThisMonth} />
        <TasksWithoutTimeLimit tasks={nonTimeboundTasks} />
      </div>
    </div>
  );
}
