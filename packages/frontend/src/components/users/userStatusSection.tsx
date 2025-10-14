'use client';
import { useState, useTransition } from "react";
import type { User, UpdateUserDisabledRequest } from "@task-manager/common";
import { updateUserDisabledAction } from "@/lib/actions/users";
import { Shield, ShieldOff, Edit, Save, X, AlertTriangle } from "lucide-react";

interface UserStatusSectionProps {
  user: User;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UserStatusSection({ user, isEditing, onEdit, onCancel, onSuccess }: UserStatusSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState<boolean>(user.disabled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (disabled === user.disabled) {
      onCancel();
      return;
    }

    startTransition(async () => {
      const result = await updateUserDisabledAction(user.id, { disabled } as UpdateUserDisabledRequest);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to update user status");
        setDisabled(user.disabled);
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user.disabled ? (
              <ShieldOff className="h-6 w-6 text-red-400" />
            ) : (
              <Shield className="h-6 w-6 text-green-400" />
            )}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Account Status
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {user.disabled ? 'User account is disabled' : 'User account is active'}
              </p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Edit className="h-4 w-4 mr-2" />
            Manage Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center space-x-3">
          {disabled ? (
            <ShieldOff className="h-6 w-6 text-red-400" />
          ) : (
            <Shield className="h-6 w-6 text-green-400" />
          )}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Manage Account Status
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enable or disable this user account
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Account Status
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {disabled
                    ? 'This account is currently disabled. The user cannot log in or access any resources.'
                    : 'This account is currently active. The user can log in and access resources based on their permissions.'
                  }
                </p>
              </div>
              <div className="ml-4">
                <button
                  type="button"
                  onClick={() => setDisabled(!disabled)}
                  disabled={isPending}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
                    disabled ? 'bg-red-600' : 'bg-green-600'
                  }`}
                  role="switch"
                  aria-checked={!disabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      disabled ? 'translate-x-0' : 'translate-x-5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-3">
              {disabled ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <ShieldOff className="h-3 w-3 mr-1" />
                  Disabled
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Active
                </span>
              )}
            </div>
          </div>

          {disabled !== user.disabled && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      {disabled
                        ? 'Disabling this account will immediately log out the user and prevent them from accessing the system.'
                        : 'Enabling this account will allow the user to log in and access resources based on their permissions.'
                      }
                    </p>
                  </div>
                </div>
              </div>
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
              onClick={() => {
                setDisabled(user.disabled);
                setError(null);
                onCancel();
              }}
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || disabled === user.disabled}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}