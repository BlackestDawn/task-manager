import { getTasksAction } from "@/lib/actions/tasks";
import ProtectedRoute from "@/components/auth/protectedRoute";
import type { Metadata } from "next";
import { isThisMonth, isThisWeek, sortTasksByFinishDate, type Task } from "@task-manager/common";
import DashboardStats from "@/components/dashboard/dashboardStats";
import DashboardTaskSections from "@/components/dashboard/dashboardTaskSections";
import DashboardQuickActions from "@/components/dashboard/dashboardQuickActions";

export const metadata: Metadata = {
  title: 'Task Manager - Dashboard',
  description: 'Dashboard overview of tasks and activities.',
};

export default async function DashboardPage() {
  const tasks = await getTasksAction();

  const tasksForThisWeek = tasks.filter(task => isThisWeek(task.finishBy || '')).sort(sortTasksByFinishDate);
  const tasksForThisMonth = tasks.filter(task => isThisMonth(task.finishBy || '')).sort(sortTasksByFinishDate);
  const nonTimeboundTasks = tasks.filter(task => !task.finishBy);
  const completedTasks = tasks.filter(task => task.completed);
  const overdueTasks = tasks.filter(task => !task.completed && task.finishBy && new Date(task.finishBy) < new Date());
  const nextTask: Task | undefined =
    tasks.filter(t => !t.completed && t.finishBy).sort(sortTasksByFinishDate)[0]
    || nonTimeboundTasks[0] || undefined;

  return (
    <ProtectedRoute>
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

        <DashboardQuickActions />

        {/* Task Sections */}
        <DashboardTaskSections
          nextTask={nextTask}
          tasksForThisWeek={tasksForThisWeek}
          tasksForThisMonth={tasksForThisMonth}
          nonTimeboundTasks={nonTimeboundTasks}
          overdueTasks={overdueTasks}
        />
      </div>
    </ProtectedRoute>
  );
}
