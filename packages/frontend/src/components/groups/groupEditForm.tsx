'use client';
import { useForm } from "@tanstack/react-form";
import { useUpdateGroup } from "@/lib/api/groups/queries";
import type { Group, UpdateGroupRequest } from "@task-manager/common";
import { validateUpdateGroupRequest } from "@task-manager/common";
import { Save, X, Users } from "lucide-react";

interface GroupEditFormProps {
  group: Group;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function GroupEditForm( { group, onCancel, onSuccess}: GroupEditFormProps) {
  const updateGroupMutation = useUpdateGroup();

  const form = useForm({
    defaultValues: {
      name: group.name,
      description: group.description || '',
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData: UpdateGroupRequest = validateUpdateGroupRequest({
          id: group.id,
          name: value.name,
          desciption: value.description || null,
        });

        await updateGroupMutation.mutateAsync({
          id: group.id,
          data: validatedData,
        });

        onSuccess();
      } catch (error) {
        console.error("Update group failed:", error);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-gray-400" />
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Edit Group
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update the group&apos;s information
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={() => form.handleSubmit()}
                disabled={updateGroupMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateGroupMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <form className="space-y-6">
            <form.Field name="name">
              {(field) => (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Group Name
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
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Enter group description"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          </form>

          {updateGroupMutation.error && (
            <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Failed to update group. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
