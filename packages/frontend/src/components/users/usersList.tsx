'use client';
import { useState } from "react";
import { useUsers, useDeleteUser } from "@/lib/api/users/queries";
import { Can } from "@/components/auth/can";
import { User, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useAuthContext } from "../auth/clientAuthProvider";
import Link from "next/link";
import LoadingSpinner from "@/components/general/loadingSpinner";

export default function UsersList() {
  const { data: users = [], isLoading, error } = useUsers();
  const { user: currentUser } = useAuthContext();
  const deleteUserMutation = useDeleteUser();

  const [ deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setDeletingId(id);
      try {
        await deleteUserMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <li key={user.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    {user.disabled && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Disabled
                      </span>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{user.login}
                    {user.email && ` • ${user.email}`}
                  </p>
                  {user.groups.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Groups: {user.groups.map(g => g.role).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${user.disabled
                  ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900"
                  : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
                }`}>
                  {user.disabled
                    ? <UserX className="h-5 w-5" />
                    : <UserCheck className="h-5 w-5" />}
                </div>

                <Can I="update" a="User">
                  <Link href={`/users/${user.id}`}>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full"
                      title="Edit user"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </Link>
                </Can>

                <Can I="delete" a="User">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deletingId === user.id || user.id === currentUser?.id}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete user"
                  >
                    {deletingId === user.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </Can>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {users.length === 0 && (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new user.
          </p>
        </div>
      )}
    </div>
  );
}
