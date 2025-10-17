import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAuthAction } from "@/lib/actions/auth";
import { getGroupsAction } from "@/lib/actions/groups";
import Link from "next/link";
import { Users, CheckSquare } from "lucide-react";
import type { Group } from "@task-manager/common";
import { Suspense } from "react";
import LoadingSpinner from "@/components/general/loadingSpinner";
import CreateGroupSection from "@/components/groups/createGroupSection";

export const metadata: Metadata = {
  title: "Task Managers - Groups",
  description: "Manage groups and team collaboration",
}

export default async function GroupsPage() {
  const { isAuthenticated } = await checkAuthAction();

  if (!isAuthenticated) redirect("/login?redirect=/groups");

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GroupsList />
    </Suspense>
  )
}

function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-indigo-500"
    >
      <div className="flex items-start">
        <div className="p-2 rounded-lg mr-4 bg-indigo-100 dark:bg-indigo-900">
          <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {group.name}
            </h3>
          </div>
          {group.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {group.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Members</span>
            </div>
            <div className="flex items-center">
              <CheckSquare className="h-4 w-4 mr-1" />
              <span>Tasks</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

async function GroupsList() {
  const groups = await getGroupsAction();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Groups
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage groups and team collaboration
            </p>
          </div>
          <CreateGroupSection />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No groups found
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
