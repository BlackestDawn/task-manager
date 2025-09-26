'use client';
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useCreateUser } from "@/lib/api/users/queries";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { CreateUserRequest } from "@task-manager/common";
import { validateCreateUserRequest, userRoleList } from "@task-manager/common";
import { Eye, EyeOff, UserPlus, X, Shield } from "lucide-react";

interface CreateUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { user: currentUser } = useAuthContext();
  const createUserMutation = useCreateUser();

  const canSetAccessLevel = currentUser?.accessLevel === 'admin' || currentUser?.accessLevel === 'manager';

  const form = useForm({
    defaultValues: {
      login: '',
      password: '',
      name: '',
      email: '',
      accessLevel: 'user' as typeof userRoleList[number],
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData: CreateUserRequest = validateCreateUserRequest(value);
        await createUserMutation.mutateAsync(validatedData);
        onSuccess?.();
      } catch (error) {
        console.error("Create user failed:", error);
      }
    },
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Create New User
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
        <form.Field name="login">
          {(field) => (
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Login
              </label>
              <input
                id="login"
                type="text"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter username"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter full name"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email (Optional)
              </label>
              <input
                id="email"
                type="email"
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value || '')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter email address"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {canSetAccessLevel && (
          <form.Field name="accessLevel">
            {(field) => (
              <div>
                <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Access Level
                </label>
                <select
                  id="accessLevel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as typeof userRoleList[number])}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm capitalize"
                >
                  {userRoleList.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {field.state.value === 'admin' && 'Full system access - can manage all users, groups, and tasks'}
                  {field.state.value === 'manager' && 'Can create groups and manage users, but limited system access'}
                  {field.state.value === 'user' && 'Standard user access - can only manage own tasks and participate in groups'}
                </p>
              </div>
            )}
          </form.Field>
        )}

        {createUserMutation.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Failed to create user. Please try again.
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={createUserMutation.isPending}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {createUserMutation.isPending ? 'Creating...' : 'Create User'}
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