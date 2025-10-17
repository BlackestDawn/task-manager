import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAuthAction } from "@/lib/actions/auth";
import { getUsersAction } from "@/lib/actions/users";
import Link from "next/link";
import { User as UserIcon, Mail, Shield } from "lucide-react";
import type { User } from "@task-manager/common";
import { Suspense } from "react";
import LoadingSpinner from "@/components/general/loadingSpinner";
import CreateUserSection from "@/components/users/createUserSection";

export const metadata: Metadata = {
  title: 'Task Manager - Users',
  description: 'Manage users',
};

interface UsersListProps {
  users: User[];
}

export default async function UsersPage() {
  const { isAuthenticated } = await checkAuthAction();

  if (!isAuthenticated) redirect("/login?redirect=/users");

  const users = await getUsersAction();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UsersList users={users} />
    </Suspense>
  );
}

function UserCard({ user }: { user: User }) {
  return (
    <Link
      href={`/users/${user.id}`}
      className={`
        block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-indigo-500
        ${user.disabled ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-start">
        <div className={`
          p-2 rounded-lg mr-4
          ${user.disabled
            ? "bg-gray-100 dark:bg-gray-700"
            : "bg-indigo-100 dark:bg-indigo-900"
          }
        `}>
          <UserIcon className={`
            h-6 w-6
            ${user.disabled
              ? "text-gray-400"
              : "text-indigo-600 dark:text-indigo-400"
            }
          `} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {user.name}
            </h3>
            {user.disabled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                Disabled
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            @{user.login}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {user.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              <span className="capitalize">{user.accessLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function UsersList({ users }: UsersListProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Users
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage users and permissions
            </p>
          </div>
          <CreateUserSection />
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No users yet
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
