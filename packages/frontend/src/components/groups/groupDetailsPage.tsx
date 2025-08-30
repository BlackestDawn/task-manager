'use client';
import { useState } from "react";
import Link from "next/link";
import { useGroup, useGroupMembers, useGroupTasks, useDeleteGroup } from "@/lib/api/groups/queries";
import { useGroupPermissions } from "@/hooks/useGroupPermissions";
// import { useAuthContext } from "@/components/auth/authProvider";
import GroupEditForm from "./groupEditForm";
import GroupMembersSection from "./groupMembersSection";
import GroupTasksSection from "./groupTasksSection";
import { ArrowLeft, Edit, Trash2, Users, CheckSquare, Calendar, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/general/loadingSpinner";

interface GroupDetailsPageProps {
  groupId: string;
}

export default function GroupDetailsPage({ groupId }: GroupDetailsPageProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "tasks">("overview");

  const router = useRouter();
  // const { user } = useAuthContext();
  const { data: group, isLoading, error } = useGroup(groupId);
  const { data: members = [] } = useGroupMembers(groupId);
  const { data: tasks = [] } = useGroupTasks(groupId);

  const {
    canUpdateGroup,
    canDeleteGroup,
    canManageGroupUsers,
    canAssignTaskToGroup,
    canRemoveTaskFromGroup,
    getUserRoleInGroup
  } = useGroupPermissions();

  const deleteGroupMutation = useDeleteGroup();

  const userRole = getUserRoleInGroup(groupId);
  const canEdit = canUpdateGroup(group);
  const canDelete = canDeleteGroup(group);
  const canManageUsers = canManageGroupUsers(group);
  const canAssignTask = canAssignTaskToGroup(group);
  const canRemoveTask = canRemoveTaskFromGroup(group);

  const handleDeleteGroup = async () => {
    if (window.confirm(`Areyou sure you want to delete "${group?.name}"?`)) {
      try {
        await deleteGroupMutation.mutateAsync(groupId);
        router.push("/groups");
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error || !group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Group not found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The group you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <div className="mt-6">
            <Link
              href="/groups"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GroupEditForm
          group={group}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/groups"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Groups
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Group
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDeleteGroup}
                disabled={deleteGroupMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete Group'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {group.name}
          </h1>
          {group.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {group.description}
            </p>
          )}
          {userRole && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                userRole === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                userRole === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                userRole === 'editor' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                Your role: {userRole}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Members
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {members.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckSquare className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Tasks
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {tasks.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Created
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <CheckSquare className="h-4 w-4 inline mr-2" />
            Tasks ({tasks.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Group Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Basic details about this group.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {group.name}
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {group.description || (
                      <span className="text-gray-400 italic">No description provided</span>
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {new Date(group.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {new Date(group.updatedAt).toLocaleDateString('en-US', {
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
        )}

        {activeTab === 'members' && (
          <GroupMembersSection
            groupId={groupId}
            canManageUsers={canManageUsers}
          />
        )}

        {activeTab === 'tasks' && (
          <GroupTasksSection
            groupId={groupId}
            canAssignTask={canAssignTask}
            canRemoveTask={canRemoveTask}
          />
        )}
      </div>
    </div>
  );
}