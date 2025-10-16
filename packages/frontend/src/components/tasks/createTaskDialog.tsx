'use client';
import { useState, useTransition } from "react";
import { createTaskAction } from "@/lib/actions/tasks";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { CreateTaskRequest } from "@task-manager/common";
import { Calendar, X } from "lucide-react";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefilledDate?: Date | null;
}

export default function CreateTaskDialog({ isOpen, onClose, onSuccess, prefilledDate = null }: CreateTaskDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const [formData, setFormData] = useState<CreateTaskRequest>({
    userId: user!.id,
    title: "",
    description: "",
    finishBy: prefilledDate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createTaskAction({
        ...formData,
        finishBy: formData.finishBy ? new Date(formData.finishBy) : null,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to create task");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-10">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Create New Task
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isPending}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm disabled:opacity-50"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isPending}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm disabled:opacity-50"
                    placeholder="Add task description (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="finishBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Due Date
                  </label>
                  <input
                    id="finishBy"
                    type="date"
                    value={formData.finishBy ? formatDateForInput(new Date(formData.finishBy)) : ""}
                    onChange={(e) => setFormData({ ...formData, finishBy: e.target.value ? new Date(e.target.value) : null })}
                    disabled={isPending}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty if no deadline is needed
                  </p>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={isPending || !formData.title}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Creating..." : "Create Task"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}