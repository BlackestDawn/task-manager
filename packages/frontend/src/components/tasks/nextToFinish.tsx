import TaskCard from "./taskCard";
import type { TaskProp } from "@/lib/data/interfaces/task";
import { Star, Plus, Target } from "lucide-react";
import Link from "next/link";

export default function ShowNextTaskToFinish({ task }: TaskProp) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recommended Next Task
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Based on priority and due dates
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {task ? (
          <div className="max-w-md mx-auto">
            <div className="transform transition-transform hover:scale-105">
              <TaskCard task={task} />
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/tasks/${task.id}`}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Start Working
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No tasks to work on
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              All caught up! Create a new task to get started.
            </p>
            <Link
              href="/tasks"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
