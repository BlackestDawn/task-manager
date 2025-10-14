'use client';
import { useState, useTransition } from "react";
import type { UpdateUserRequest, User, UserRole } from "@task-manager/common";
import { userRoleList } from "@task-manager/common";
import { updateUserAction } from "@/lib/actions/users";
import { User as UserIcon, Mail, Crown, Edit, Save, X } from "lucide-react";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

interface UserBasicInfoSectionProps {
  user: User;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UserBasicInfoSection({ user, isEditing, onEdit, onCancel, onSuccess }: UserBasicInfoSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuthContext();

  const [formData, setFormData] = useState({
    login: user.login,
    name: user.name,
    email: user.email || "",
    accessLevel: user.accessLevel as UserRole,
  });

  const isCurrentUser = currentUser?.id === user.id;
  const canChangeAccessLevel = (currentUser?.accessLevel === "admin" || currentUser?.accessLevel === "manager") && !isCurrentUser;

  const availableAccessLevels: UserRole[] = currentUser?.accessLevel === "admin"
    ? [...userRoleList]
    : currentUser?.accessLevel === "manager"
      ? ["manager", "user"] as UserRole[]
      : ["user"] as UserRole[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const updates: Record<string, string | null | undefined> = {};

      if (formData.login !== user.login) updates.login = formData.login;
      if (formData.name !== user.name) updates.name = formData.name;
      if (formData.email !== user.email) updates.email = formData.email;
      if (canChangeAccessLevel && formData.accessLevel !== user.accessLevel) updates.accessLevel = formData.accessLevel;

      if (Object.keys(updates).length === 0) {
        onCancel();
        return;
      }

      const result = await updateUserAction(user.id, { ...formData, ...updates } as UpdateUserRequest);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to update user");
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Basic Information
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                User account details
              </p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center space-x-3">
          <UserIcon className="h-6 w-6 text-gray-400" />
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Edit Basic Information
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update user account details
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <div className="space-y-6">
          {/* Login */}
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Login
            </label>
            <input
              id="login"
              type="text"
              required
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              disabled={isPending}
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              disabled={isPending}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              disabled={isPending}
            />
          </div>

          {canChangeAccessLevel && (
            <div>
              <label htmlFor="accessLevel" className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                Access Level
              </label>
              <select
                id="accessLevel"
                value={formData.accessLevel}
                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value as UserRole })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm capitalize"
                disabled={isPending}
              >
                {availableAccessLevels.map((role) => (
                  <option key={role} value={role} className="capitalize">
                    {role}
                  </option>
                ))}
              </select>
              {currentUser?.accessLevel === 'manager' && user.accessLevel === 'admin' && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ As a manager, you cannot modify admin users&apos; access level
                </p>
              )}
              {currentUser?.accessLevel === 'manager' && user.accessLevel !== 'admin' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  You can only set manager or user level
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Cannot change your own access level
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}