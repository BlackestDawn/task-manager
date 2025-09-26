'use client';
import type { User } from "@task-manager/common";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { User as UserIcon, Mail, Calendar, Shield, ShieldOff, Crown, Settings } from "lucide-react";

interface UserDetailsViewProps {
  user: User;
}

export default function UserDetailsView({ user }: UserDetailsViewProps) {
  const { user: currectUser } = useAuthContext();
  const isCurrentUser = currectUser?.id === user.id;

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    };
  }

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "admin": return <Crown className="h-3 w-3 mr-1" />;
      case "manager": return <Settings className="h-3 w-3 mr-1" />;
      default: return <UserIcon className="h-3 w-3 mr-1" />
    };
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center space-x-3">
          <UserIcon className="h-8 w-8 text-gray-400" />
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              User Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Personal details and account information.
            </p>
          </div>
          {isCurrentUser && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Crown className="h-3 w-3 mr-1" />
              You
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <dl>
          {/* Full Name */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Full name
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
              {user.name}
            </dd>
          </div>

          {/* Login */}
          <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Login
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
              @{user.login}
            </dd>
          </div>

          {/* Email */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email address
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
              {user.email || (
                <span className="text-gray-400 italic">No email provided</span>
              )}
            </dd>
          </div>

          {/* Access Level */}
          <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Access Level
            </dt>
            <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getAccessLevelColor(user.accessLevel)}`}>
                {getAccessLevelIcon(user.accessLevel)}
                {user.accessLevel}
              </span>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {user.accessLevel === 'admin' && 'Full system access - can manage all users, groups, and tasks'}
                {user.accessLevel === 'manager' && 'Can create groups and manage users, but limited system access'}
                {user.accessLevel === 'user' && 'Standard user access - can only manage own tasks and participate in groups'}
              </p>
            </dd>
          </div>

          {/* Account Status */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              {user.disabled ? (
                <ShieldOff className="h-4 w-4 mr-1" />
              ) : (
                <Shield className="h-4 w-4 mr-1" />
              )}
              Account status
            </dt>
            <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
              {user.disabled ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Disabled
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              )}
            </dd>
          </div>

          {/* Group Memberships */}
          {user.groups.length > 0 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Group Memberships
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {user.groups.map((group) => (
                    <span key={group.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {group.role}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}

          {/* Created Date */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Member since
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </dd>
          </div>

          {/* Last Updated */}
          <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last updated
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
              {new Date(user.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
