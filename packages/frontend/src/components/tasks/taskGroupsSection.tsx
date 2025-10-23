import type { Group } from "@task-manager/common";
import { Users, Eye } from "lucide-react";
import Link from "next/link";

interface TaskGroupsSectionProps {
  groups: Group[];
}

export default function TaskGroupsSection({ groups }: TaskGroupsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Assigned Groups
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Groups that this task is assigned to
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This task is not assigned to any groups
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Groups can assign tasks from their group management page
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {groups.map((group) => (
              <li key={group.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {group.name}
                    </p>
                    {group.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Link
                    href={`/groups/${group.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Group
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        {groups.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <Users className="h-4 w-4 inline mr-1" />
              This task is assigned to {groups.length} group{groups.length !== 1 ? 's' : ''}.
              Group managers can remove this task from their groups via the group management page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}