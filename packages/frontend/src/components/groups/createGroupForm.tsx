'use client';
import { useState, useTransition } from "react";
import { createGroupAction } from "@/lib/actions/groups";
import { Users, X } from "lucide-react";

interface CreateGroupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateGroupForm({ onSuccess, onCancel }: CreateGroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    startTransition(async () => {
      const result = await createGroupAction({
        name: formData.name,
        description: formData.description || "",
      });

      if (result.success) {
        setFormData({
          name: "",
          description: "",
        });
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || "Failed to create group");
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Create New Group
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Group Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Enter group name"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Enter group description (optional)"
            disabled={isPending}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional: Provide a brief description of the group&apos;s purpose
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Users className="h-4 w-4 mr-2" />
            {isPending ? 'Creating...' : 'Create Group'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}