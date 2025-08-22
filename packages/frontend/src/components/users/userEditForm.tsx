'use client';
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useUpdateUser, useUpdateUserPassword, useUpdateUserDisabledStatus } from "@/lib/api/users/queries";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useAuthContext } from "@/components/auth/authProvider";
import { type User, validateUpdateUserRequest } from "@task-manager/common";
import { Save, X, Eye, EyeOff, Shield, ShieldOff, Lock, User as UserIcon, Mail } from "lucide-react";

interface UserEditFormProps {
  user: User;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UserEditForm({ user, onCancel, onSuccess }: UserEditFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordSection, setShowPasswordSection] = useState<boolean>(false);
  const { user: currentUser } = useAuthContext();
  const { canManageUserStatus } = useUserPermissions();

  const updateUserMutation = useUpdateUser();
  const updatePasswordMutation = useUpdateUserPassword();
  const updateStatusMutation = useUpdateUserDisabledStatus();

  const isCurrentUser = currentUser?.id === user.id;
  const canChangeStatus = canManageUserStatus(user);

  const form = useForm({
    defaultValues: {
      login: user.login,
      name: user.name,
      email: user.email || '',
    },
    onSubmit: async ({ value }) => {
      try {
        const updates = {
          id: user.id,
          login: value.login !== user.login ? value.login : undefined,
          name: value.name !== user.name ? value.name : undefined,
          email: value.email !== (user.email || '') ? (value.email || null) : undefined,
        };

        // Remove undefined values
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(cleanUpdates).length > 1) { // More than just id
          await updateUserMutation.mutateAsync({
            id: user.id,
            data: cleanUpdates
          });
        }

        onSuccess();
      } catch (error) {
        console.error('Update user failed:', error);
      }
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        await updatePasswordMutation.mutateAsync({
          id: user.id,
          password: value.password,
        });
        setShowPasswordSection(false);
        passwordForm.reset();
      } catch (error) {
        console.error('Update password failed:', error);
      }
    },
  });

  const handleStatusToggle = async () => {
    if (window.confirm(`Are you sure you want to ${user.disabled ? 'enable' : 'disable'} this user?`)) {
      try {
        await updateStatusMutation.mutateAsync({
          id: user.id,
          disabled: !user.disabled,
        });
      } catch (error) {
        console.error('Update status failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main User Information */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Edit User Information
              </h3>
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
                disabled={updateUserMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <form className="space-y-6">
            {/* Login */}
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
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Name */}
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
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Email */}
            <form.Field name="email">
              {(field) => (
                <div>
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Optional email address"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          </form>

          {updateUserMutation.error && (
            <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Failed to update user information. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-gray-400" />
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Password
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {isCurrentUser ? 'Change your password' : 'Reset user password'}
                </p>
              </div>
            </div>
            {!showPasswordSection && (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {showPasswordSection && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                passwordForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <passwordForm.Field name="password">
                {(field) => (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
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
              </passwordForm.Field>

              <passwordForm.Field name="confirmPassword">
                {(field) => (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </passwordForm.Field>

              {updatePasswordMutation.error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Failed to update password. Please try again.
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    passwordForm.reset();
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Account Status Section */}
      {canChangeStatus && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {user.disabled ? (
                  <ShieldOff className="h-6 w-6 text-red-500" />
                ) : (
                  <Shield className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Account Status
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {user.disabled
                      ? 'This account is currently disabled'
                      : 'This account is currently active'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleStatusToggle}
                disabled={updateStatusMutation.isPending}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  user.disabled
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-white bg-red-600 hover:bg-red-700'
                }`}
              >
                {updateStatusMutation.isPending ? 'Updating...' : (
                  user.disabled ? 'Enable Account' : 'Disable Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}