'use client';
import { useState, useTransition } from "react";
import type { Task } from "@task-manager/common";
import { updateTaskDoneStatusAction } from "@/lib/actions/tasks";
import { CheckSquare, Square, Edit, X } from "lucide-react";

interface TaskStatusSectionProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TaskStatusSection({ task, isEditing, onEdit, onCancel, onSuccess }: TaskStatusSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(task.completed);

  const handleToggleStatus = () => {
    setError(null);
    const newStatus = !completed;
    setCompleted(newStatus);

    startTransition(async () => {
      const result = await updateTaskDoneStatusAction(task.id, { completed: newStatus });
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to update task status");
        setCompleted(!newStatus);
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {task.completed ? (
              <CheckSquare className="h-6 w-6 text-green-500" />
            ) : (
              <Square className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Task Status
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Mark task as complete or incomplete
              </p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Edit className="h-4 w-4 mr-2" />
            Change Status
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${task.completed ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"}`}>
              {task.completed ? (
                <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <Square className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${task.completed ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                {task.completed ? "Task Completed" : "Task In Progress"}
              </p>
              {task.completedAt && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Completed on {new Date(task.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {completed ? (
              <CheckSquare className="h-6 w-6 text-green-500" />
            ) : (
              <Square className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Update Task Status
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Toggle task completion status
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Task Status
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Toggle between completed and in progress
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isPending}
              role="switch"
              aria-checked={completed}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 ${completed ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${completed ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {completed ? (
                <>
                  <CheckSquare className="h-4 w-4 inline mr-1" />
                  This task is marked as <strong>completed</strong>. Toggle to mark it as in progress.
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 inline mr-1" />
                  This task is marked as <strong>in progress</strong>. Toggle to mark it as completed.
                </>
              )}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <X className="h-4 w-4 mr-2" />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}