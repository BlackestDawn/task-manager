'use client';
import { useState, useTransition } from "react";
import { createUserAction } from "@/lib/actions/users";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { UserRole } from "@task-manager/common";
import { userRoleList } from "@task-manager/common";
import { Eye, EyeOff, UserPlus, X, Shield } from "lucide-react";

interface CreateUserFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function CreateUserForm({ onCancel, onSuccess }: CreateUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { user: currentUser } = useAuthContext();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    name: "",
    email: "",
    accessLevel: "user" as UserRole,
  });

  const canSetAccessLevel = currentUser?.accessLevel === "admin" || currentUser?.accessLevel === "manager";

  const availableAccessLevels: UserRole[] = currentUser?.accessLevel === "admin"
    ? [...userRoleList]
    : currentUser?.accessLevel === "manager"
      ? ["manager", "user"] as UserRole[]
      : ["user"] as UserRole[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.login.trim()) {
      setError("Login is required");
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    startTransition(async () => {
      const result = await createUserAction({
        login: formData.login,
        password: formData.password,
        name: formData.name,
        email: formData.email || null,
        accessLevel: formData.accessLevel,
      });

      if (result.success) {
        setFormData({
          login: "",
          password: "",
          name: "",
          email: "",
          accessLevel: userRoleList[0],
        });
        onSuccess?.();
      } else {
        setError(result.error || "Failed to create user");
      }
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Create New User
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
            placeholder="Enter username"
            disabled={isPending}
          />
        </div>

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
            placeholder="Enter full name"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Enter email address"
            disabled={isPending}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter password"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Must be at least 8 characters long
          </p>
        </div>

        {canSetAccessLevel && (
          <div>
            <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Shield className="h-4 w-4 inline mr-1" />
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.accessLevel === 'admin' && 'Full system access - can manage all users, groups, and tasks'}
              {formData.accessLevel === 'manager' && 'Can create groups and manage users, but limited system access'}
              {formData.accessLevel === 'user' && 'Standard user access - can only manage own tasks and participate in groups'}
            </p>
            {currentUser?.accessLevel === 'manager' && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ As a manager, you cannot create admin users
              </p>
            )}
          </div>
        )}

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
            <UserPlus className="h-4 w-4 mr-2" />
            {isPending ? 'Creating...' : 'Create User'}
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
