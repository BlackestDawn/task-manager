'use client';
import { useState } from "react";
import { useGroupMembers, useRemoveUserFromGroup } from "@/lib/api/groups/queries";
import { User, Shield, UserMinus, UserPlus, Crown, Edit, Settings, Eye } from "lucide-react";
import LoadingSpinner from "@/components/general/loadingSpinner";

interface GroupMembersSectionProps {
  groupId: string;
  canManageUsers: boolean;
}

export default function GroupMembersSection({ groupId, canManageUsers }: GroupMembersSectionProps) {
  const { data: members = [], isLoading, error } = useGroupMembers(groupId);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const removeUserMutation = useRemoveUserFromGroup();

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from this group?`)) {
      setRemovingUserId(userId);
      try {
        await removeUserMutation.mutateAsync({ groupId, userId });
      } catch (error) {
        console.error("Failed to remove user:", error);
      } finally {
        setRemovingUserId(null);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4" />;
      case "manager": return <Settings className="h-4 w-4" />;
      case "editor": return <Edit className="h-4 w-4" />;
      case "viewer": return <Eye className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'editor': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    }
  };

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load group members. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canManageUsers && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage group members and their roles
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div>

        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {members.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <li key={member.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </span>
                        {member.disabled && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{member.login}
                        {member.email && ` • ${member.email}`}
                      </p>
                    </div>
                  </div>

                  {canManageUsers && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRemoveUser(member.id, member.name)}
                        disabled={removingUserId === member.id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from group"
                      >
                        {removingUserId === member.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No members</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {canManageUsers
                ? "Add members to get started."
                : "This group doesn't have any members yet."}
            </p>
            {canManageUsers && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
