'use client';
import { useForm } from "@tanstack/react-form";
import { useCreateGroup } from "@/lib/api/groups/queries";
import type { CreateGroupRequest } from "@task-manager/common";
import { validateCreateGroupRequest } from "@task-manager/common";
import { X, UserPlus } from "lucide-react";

interface CreateGroupFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateGroupForm({ onSuccess, onCancel}: CreateGroupFormProps) {
  const createGroupMutation = useCreateGroup();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData: CreateGroupRequest = validateCreateGroupRequest(value);
        await createGroupMutation.mutateAsync(validatedData);
        onSuccess?.();
      } catch (error) {
        console.error("Failed to create group:", error);
      }
    },
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Create New Group
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="name">
          {(field) => (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter group name"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Desription
              </label>
              <input
                id="description"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter a description"
              />
            </div>
          )}
        </form.Field>

        {createGroupMutation.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Failed to create group. Please try again.
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={createGroupMutation.isPending}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}