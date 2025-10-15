'use client';
import { useState, useTransition } from "react";
import type { Group, UpdateGroupRequest } from "@task-manager/common";
import { updateGroupAction, deleteGroupAction } from "@/lib/actions/groups";
import { Users, FileText, Calendar, Edit, Save, X, Trash2 } from "lucide-react";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { useRouter } from "next/navigation";
import { defineAbilityFor } from "@task-manager/common";

interface GroupBasicInfoSectionProps {
  group: Group;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function GroupBasicInfoSection({ group, isEditing, onEdit, onCancel, onSuccess }: GroupBasicInfoSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user: currentUser } = useAuthContext();
  const router = useRouter();

  const [formData, setFormData] = useState<UpdateGroupRequest>({
    name: group.name,
    description: group.description || "",
  });

  const ability = defineAbilityFor(currentUser);
  const canEdit = ability.can("update", group);
  const canDelete = ability.can("delete", group);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateGroupAction(group.id, {
        name: formData.name,
        description: formData.description || "",
      });
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to update group");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGroupAction(group.id);
      if (result.success) {
        router.push("/groups");
      } else {
        setError(result.error || "Failed to delete group");
      }
    });
  };

  if (isEditing && canEdit) {
    return (
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            Group Name
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{group.name}</dd>
        </div>

        <div className="sm:col-span-1">
          <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            Created At
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {new Date(group.createdAt).toLocaleDateString()}
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <FileText className="h-4 w-4 mr-2" />
            Description
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {group.description || "No description provided"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
        <div>
          {canDelete && (
            showDeleteConfirm ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-red-600 dark:text-red-400">Are you sure?</p>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Group
              </button>
            )
          )}
        </div>

        {canEdit && !isEditing && (
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Info
          </button>
        )}
      </div>
    </div>
  );
}