import TaskCard from "./taskCard";
import type { TaskArrayProp } from "@/lib/data/interfaces/task";
import { Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TasksWithoutTimeLimit({ tasks }: TaskArrayProp) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No Time Limit
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} without deadlines
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
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No ongoing tasks
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              All your flexible tasks are complete.
            </p>
            <Link
              href="/tasks"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="transform transition-transform hover:scale-105">
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
