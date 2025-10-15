'use client';
import { useState, useTransition } from "react";
import type { Task, UpdateTaskRequest } from "@task-manager/common";
import { updateTaskAction, deleteTaskAction } from "@/lib/actions/tasks";
import { FileText, Calendar, Edit, Save, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TaskBasicInfoSectionProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TaskBasicInfoSection({ task, isEditing, onEdit, onCancel, onSuccess }: TaskBasicInfoSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const router = useRouter();

  const [formData, setFormData] = useState<UpdateTaskRequest>({
    title: task.title,
    description: task.description || "",
    finishBy: task.finishBy || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateTaskAction(task.id, {
        title: formData.title,
        description: formData.description || "",
        finishBy: formData.finishBy ? new Date(formData.finishBy) : null,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to update task");
      }
    });
  };

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (result.success) {
        router.push("/tasks");
      } else {
        setError(result.error || "Failed to delete task");
        setShowDeleteConfirm(false);
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Task Details
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Task information and deadline
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Delete this task?
                </h4>
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                  This action cannot be undone. This will permanently delete the task.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Delete Task"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Edit Task Details
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update task information and deadline
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-6">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
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
              value={formData.finishBy ? new Date(formData.finishBy).toISOString().split('T')[0] : ""}
              onChange={(e) => setFormData({ ...formData, finishBy: new Date(e.target.value) || null })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}