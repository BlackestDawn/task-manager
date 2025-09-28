import type { Task } from "@task-manager/common";
import type { LucideIcon } from "lucide-react";
import TaskCard from "@/components/tasks/taskCard";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

interface TaskSectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  tasks: Task[];
  showAsGrid: boolean;
  variant: "featured" | "urgent" | "normal";
}

export default function TaskSectionCard({
  title,
  description,
  icon: IconComponent,
  iconColor,
  iconBgColor,
  tasks,
  showAsGrid,
  variant,
}: TaskSectionCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "featured":
        return "border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20";
      case "urgent":
        return "border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20";
      default:
        return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
    }
  };

  const displayTasks: Task[] = showAsGrid ? tasks.slice(0, 6) : tasks.slice(0, 1);
  const hasMoreTasks = tasks.length > displayTasks.length;

  return (
    <div className={`rounded-lg border shadow-sm ${getVariantStyles()}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${iconBgColor}`}>
              <IconComponent className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>

          {tasks.length > 0 && (
            <Link
              href="/tasks"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className={`mx-auto h-12 w-12 rounded-full ${iconBgColor} flex items-center justify-center mb-4`}>
              <IconComponent className={`h-6 w-6 ${iconColor}`} />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No tasks in this section
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {variant === "urgent" ? "Great! No overdue tasks." : "Create a new task to get started."}
            </p>
            {variant !== "urgent" && (
              <Link
                href="/tasks"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Link>
            )}
          </div>
        ) : showAsGrid ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayTasks.map((task) => (
                <div key={task.id} className="transform transition-transform hover:scale-105">
                  <TaskCard task={task} />
                </div>
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
        ) : (
          <div className="max-w-md mx-auto">
            <TaskCard task={displayTasks[0] as Task} />
          </div>
        )}
      </div>
    </div>
  );
}
