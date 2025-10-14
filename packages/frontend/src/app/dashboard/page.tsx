import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAuthAction } from "@/lib/actions/auth";
import { getTasksAction } from "@/lib/actions/tasks";
import { Suspense } from "react";
import LoadingSpinner from "@/components/general/loadingSpinner";
import type { Task, User } from "@task-manager/common";
import { isThisMonth, isThisWeek, sortTasksByFinishDate, isTaskOverdue } from "@task-manager/common";
import { Star, Calendar, CalendarDays, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: 'Task Manager - Dashboard',
  description: 'Dashboard overview of tasks and activities.',
};

export default async function DashboardPage() {
  const { user, isAuthenticated } = await checkAuthAction();

  if (!isAuthenticated) redirect("/login?redirect=/dashboard");

  const tasks = await getTasksAction();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent user={user!} tasks={tasks} />
    </Suspense>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isOverdue = isTaskOverdue(task);

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border-2 p-4 transition-all hover:shadow-lg hover:border-indigo-500"
    >
      <h3 className={`text-lg font-semibold mb-1 truncate ${task.completed ? "text-gray-500 line-through" : "text-gray-900 dark:text-white"
        }`}>
        {task.title}
      </h3>
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      {task.finishBy && (
        <div className={`text-sm flex items-center ${isOverdue ? "text-red-600" : "text-gray-600 dark:text-gray-400"
          }`}>
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {new Date(task.finishBy).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </span>
        </div>
      )}
    </Link>
  );
}

interface TaskSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  tasks: Task[];
  variant?: "featured" | "urgent" | "normal";
}

function TaskSection({ title, description, icon: Icon, iconColor, iconBgColor, tasks, variant = "normal" }: TaskSectionProps) {
  const maxDisplay = variant === "featured" ? 1: 6;
  const displayTasks = tasks.slice(0, maxDisplay);
  const hasMoreTasks = tasks.length > maxDisplay;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <div className={`p-2 rounded-lg ${iconBgColor} mr-4`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className={`mx-auto h-12 w-12 rounded-full ${iconBgColor} flex items-center justify-center mb-4`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            No tasks in this section
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {variant === "urgent" ? "Great! No overdue tasks." : "Create a new task to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={variant === "featured" ? "" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"}>
            {displayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {hasMoreTasks && (
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/tasks"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View {tasks.length - displayTasks.length} more task{tasks.length - displayTasks.length !== 1 ? 's' : ''}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DashboardContentProps {
  user: User;
  tasks: Task[];
}

function DashboardContent({ user, tasks }: DashboardContentProps) {
  const sortedTasks = tasks.sort(sortTasksByFinishDate);
  const tasksForThisWeek = sortedTasks.filter((task) => !task.completed && isThisWeek(task.finishBy));
  const tasksForThisMonth = sortedTasks.filter((task) => !task.completed && isThisMonth(task.finishBy) && !isThisWeek(task.finishBy));
  const nonTimeboundTasks = sortedTasks.filter((task) => !task.completed && !task.finishBy);
  const overdueTasks = sortedTasks.filter((task) => !task.completed && isTaskOverdue(task));

  const nextTask = sortedTasks.filter((task) => !task.completed && task.finishBy)[0] || nonTimeboundTasks[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here&apos;s an overview of your tasks
        </p>
      </div>

      <div className="space-y-8">
        {nextTask && (
          <TaskSection
            title="Recommended Next Task"
            description="Based on priority and due dates"
            icon={Star}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100 dark:bg-yellow-900"
            tasks={[nextTask]}
            variant="featured"
          />
        )}

        {overdueTasks.length > 0 && (
          <TaskSection
            title="Overdue Tasks"
            description={`${overdueTasks.length} task${overdueTasks.length !== 1 ? 's' : ''} past due date`}
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100 dark:bg-red-900"
            tasks={overdueTasks}
            variant="urgent"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TaskSection
            title="This Week"
            description={`${tasksForThisWeek.length} task${tasksForThisWeek.length !== 1 ? 's' : ''} due this week`}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            tasks={tasksForThisWeek}
          />

          <TaskSection
            title="This Month"
            description={`${tasksForThisMonth.length} task${tasksForThisMonth.length !== 1 ? 's' : ''} due this month`}
            icon={CalendarDays}
            iconColor="text-green-600"
            iconBgColor="bg-green-100 dark:bg-green-900"
            tasks={tasksForThisMonth}
          />
        </div>

        {nonTimeboundTasks.length > 0 && (
          <TaskSection
            title="No Time Limit"
            description={`${nonTimeboundTasks.length} task${nonTimeboundTasks.length !== 1 ? 's' : ''} without deadlines`}
            icon={Clock}
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100 dark:bg-gray-700"
            tasks={nonTimeboundTasks}
          />
        )}
      </div>
    </div>
  );
}
