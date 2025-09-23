'use client';
import Link from "next/link";
import { useGroups } from "@/lib/api/groups/queries";
import { useGroupPermissions } from "@/hooks/useGroupPermissions";
import { Users, CheckSquare, Plus, Edit } from "lucide-react";
import LoadingSpinner from "@/components/general/loadingSpinner";

export default function GroupsList() {
  const { data: groups = [], isLoading, error } = useGroups();
  const { canCreateGroups } = useGroupPermissions();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load groups. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/groups/${group.id}`}
                    className="text-lg font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 truncate block"
                  >
                    {group.name}
                  </Link>
                  {group.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/groups/${group.id}`}
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full"
                >
                  <Edit className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.userCount} member{group.userCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-1" />
                  <span>{group.taskCount} task{group.taskCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={`/groups/${group.id}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No groups</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {canCreateGroups()
              ? "Get started by creating a new group."
              : "You don't have access to any groups yet."}
          </p>
          {canCreateGroups() && (
            <div className="mt-6">
              <Link
                href="/groups/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}