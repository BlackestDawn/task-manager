'use client';
import { useState } from "react";
import Link from "next/link";
import type { Group, User, Task } from "@task-manager/common";
import { ArrowLeft, Users, CheckSquare, Settings } from "lucide-react";
import GroupBasicInfoSection from "./groupBasicInfoSection";
import GroupMembersListSection from "./groupMembersListSection";
import GroupTasksListSection from "./groupTasksListSection";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

interface GroupDetailsContentProps {
  group: Group;
  members: User[];
  tasks: Task[];
}

export default function GroupDetailsContent({ group, members, tasks }: GroupDetailsContentProps) {
  const [editingSection, setEditingSection] = useState<"basic" | "members" | "tasks" | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "tasks">("overview");
  const { user: currentUser } = useAuthContext();

  const userMembership = members.find((member) => member.id === currentUser?.id);
  const isGroupMember = !!userMembership;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/groups"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Groups
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {group.name}
            </h1>
            {group.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {group.description}
              </p>
            )}
          </div>
          {isGroupMember && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Users className="h-4 w-4 mr-1" />
              Member
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Group Information
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <GroupBasicInfoSection
            group={group}
            isEditing={editingSection === "basic"}
            onEdit={() => setEditingSection("basic")}
            onCancel={() => setEditingSection(null)}
            onSuccess={() => setEditingSection(null)}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <Settings className="h-5 w-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "members"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "tasks"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <CheckSquare className="h-5 w-5 inline mr-2" />
              Tasks ({tasks.length})
            </button>
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Statistics
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Overview of group activity and information
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700 px-4 py-5">
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Members
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {members.length}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700 px-4 py-5">
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Tasks
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {tasks.length}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700 px-4 py-5">
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completed Tasks
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {tasks.filter(t => t.completed).length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Group Members
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Members who belong to this group
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <GroupMembersListSection
                group={group}
                members={members}
                isEditing={editingSection === "members"}
                onEdit={() => setEditingSection("members")}
                onCancel={() => setEditingSection(null)}
                onSuccess={() => setEditingSection(null)}
              />
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Group Tasks
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Tasks assigned to this group
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <GroupTasksListSection
                group={group}
                tasks={tasks}
                isEditing={editingSection === "tasks"}
                onEdit={() => setEditingSection("tasks")}
                onCancel={() => setEditingSection(null)}
                onSuccess={() => setEditingSection(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}