import { isTaskOverdue } from "@task-manager/common";
import Link from "next/link";
import type { TaskCardProp } from "@/lib/data/interfaces/task";
import { CheckSquare, AlertTriangle, Calendar, Clock} from "lucide-react";

export default function TaskCard({ task }: TaskCardProp) {
  const isOverdue = isTaskOverdue(task);
  const hasDeadline = !!task.finishBy;

  const getCardStyle = () => {
    if (task.completed) return "border-green-200 dark:border-green-800 bg-green50/50 dark:bg-green-900/10";
    if (isOverdue) return "border-red-200 dark:border-red-800 bg-red50/50 dark:bg-red-900/10";
    return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
  }

  const getStatusStyle = () => {
    if (task.completed) return "text-green-600 dark:text-green-400";
    if (isOverdue) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  }

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString();
  }

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
    >
      <div className={`border rounded-lg p-4 shadow-sm ${getCardStyle()}`}>
        {/* Header with status icon and title */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="flex-shrink-0 mt-0.5">
            {task.completed ? (
              <CheckSquare className="h-5 w-5 text-green-500 dark:text-green-400" />
            ) : (
              <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-600 rounded" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium line-clamp-2 ${task.completed
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-white'
              }`}>
              {task.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-sm mb-3 line-clamp-2 ${task.completed
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-600 dark:text-gray-300'
            }`}>
            {task.description}
          </p>
        )}

        {/* Footer with date and status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {hasDeadline && (
              <div className={`flex items-center ${getStatusStyle()}`}>
                {isOverdue ? (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                ) : (
                  <Calendar className="h-3 w-3 mr-1" />
                )}
                <span className={isOverdue ? 'font-medium' : ''}>
                  {isOverdue ? 'Overdue' : 'Due'} {formatDate(task.finishBy as Date)}
                </span>
              </div>
            )}

            {!hasDeadline && !task.completed && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                <span>No deadline</span>
              </div>
            )}
          </div>

          {task.completed && task.completedAt && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckSquare className="h-3 w-3 mr-1" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
