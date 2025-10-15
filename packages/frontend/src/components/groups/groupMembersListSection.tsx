'use client';
import { useState, useTransition, useEffect } from "react";
import type { Group, User, GroupRole } from "@task-manager/common";
import { groupRoleList } from "@task-manager/common";
import { removeUserFromGroupAction, addUserToGroupAction } from "@/lib/actions/groups";
import { getUsersAction } from "@/lib/actions/users";
import { User as UserIcon, Mail, Shield, UserMinus, UserPlus, Edit, X, Crown, Eye, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { useGroupPermissions } from "@/hooks/useGroupPermissions";

interface GroupMembersListSectionProps {
  group: Group;
  members: User[];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function GroupMembersListSection({ group, members, isEditing, onEdit, onCancel, onSuccess }: GroupMembersListSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<GroupRole>("user");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const { user: currentUser } = useAuthContext();
  const { canAddUserToGroup, canRemoveUserFromGroup, getUserRoleInGroup } = useGroupPermissions();

  const canManageMembers = canAddUserToGroup(group) && canRemoveUserFromGroup(group);
  const userRoleInGroup = getUserRoleInGroup(group.id);

  const availableUsers = allUsers.filter(
    user => !members.some(member => member.id === user.id) && !user.disabled
  );

  const roleHierarchy: Record<GroupRole, number> = {
    "manager": 4,
    "editor": 3,
    "user": 2,
    "viewer": 1,
    "none": 0,
  };

  const getAvailableRoles = (): GroupRole[] => {
    if (currentUser?.accessLevel === "admin" || currentUser?.accessLevel === "manager") return [...groupRoleList]

    if (userRoleInGroup) {
      const userLevel = roleHierarchy[userRoleInGroup as GroupRole];
      return groupRoleList.filter(role => roleHierarchy[role] < userLevel);
    }

    return ["user"];
  };

  const availableRoles = getAvailableRoles();

  const getRoleIcon = (role: GroupRole) => {
    switch (role) {
      case "manager": return <Crown className="h-4 w-4" />;
      case "editor": return <Edit className="h-4 w-4" />;
      case "user": return <UsersIcon className="h-4 w-4" />;
      case "viewer": return <Eye className="h-4 w-4" />;
      case "none": return <X className="h-4 w-4" />;
      default: return <UsersIcon className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: GroupRole) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'none': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleDescription = (role: GroupRole) => {
    switch (role) {
      case 'manager': return 'Full group management - can manage members, tasks, and settings';
      case 'editor': return 'Can create, edit, and delete tasks in the group';
      case 'user': return 'Can view tasks and mark them as done';
      case 'viewer': return 'Read-only access to group tasks';
      case 'none': return 'No group permissions';
      default: return "";
    }
  };

  useEffect(() => {
    if (isEditing && allUsers.length === 0) {
      setLoadingUsers(true);
      getUsersAction().then(users => {
        setAllUsers(users);
        setLoadingUsers(false);
      }).catch(() => {
        setLoadingUsers(false);
        setError("Failed to load users");
      });
    }
  }, [isEditing, allUsers.length]);

  const handleRemoveUser = (userId: string) => {
    setRemovingUserId(userId);
    setError(null);

    startTransition(async () => {
      const result = await removeUserFromGroupAction(group.id, { userId });
      if (result.success) {
        setRemovingUserId(null);
        onSuccess();
      } else {
        setError(result.error || "Failed to remove user");
        setRemovingUserId(null);
      }
    });
  };

  const handleAddUser = () => {
    if (!selectedUserId) {
      setError("Please select a user to add");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await addUserToGroupAction(group.id, {
        userId: selectedUserId,
        role: selectedRole,
      });
      if (result.success) {
        setSelectedUserId("");
        setSelectedRole("user");
        onSuccess();
      } else {
        setError(result.error || "Failed to add user");
      }
    });
  };

  const getMemberRoleInGroup = (member: User): GroupRole => {
    const memberShip = member.groups.find(g => g.id === group.id);
    return (memberShip?.role || "none") as GroupRole;
  }

  if (isEditing && canManageMembers) {
    return (
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage group members. Add new members or remove existing ones.
          </p>
          <button
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4 mr-2" />
            Done
          </button>
        </div>

        {availableUsers.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                disabled={isPending || loadingUsers}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add member to group
                  </label>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedUserId("");
                      setSelectedRole("user");
                      setError(null);
                    }}
                    disabled={isPending}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select User
                  </label>
                  <select
                    id="user-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    disabled={isPending || loadingUsers}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} (@{user.login}) - {user.accessLevel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group Role
                  </label>
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as GroupRole)}
                    disabled={isPending || loadingUsers}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm capitalize"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {getRoleDescription(selectedRole)}
                  </p>
                </div>

                <button
                  onClick={handleAddUser}
                  disabled={isPending || !selectedUserId || loadingUsers}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isPending ? "Adding..." : "Add to Group"}
                </button>
              </div>
            )}
          </div>
        )}

        {availableUsers.length === 0 && !loadingUsers && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              All active users are already members of this group.
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Current Members ({members.length})
          </h4>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => {
              const memberRole = getMemberRoleInGroup(member);
              return (
                <li key={member.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(memberRole)}`}>
                          {getRoleIcon(memberRole)}
                          <span className="ml-1 capitalize">{memberRole}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email || "No email"}
                        </span>
                        <span className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          {member.accessLevel}
                        </span>
                      </div>
                    </div>
                    {member.disabled && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        Disabled
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveUser(member.id)}
                    disabled={isPending || removingUserId === member.id}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    {removingUserId === member.id ? "Removing..." : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      {members.length === 0 ? (
        <div className="text-center py-8">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No members in this group yet
          </p>
          {canManageMembers && (
            <button
              onClick={onEdit}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Members
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => {
              const memberRole = getMemberRoleInGroup(member);
              return (
                <li key={member.id} className="py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/users/${member.id}`}
                          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                        >
                          {member.name}
                        </Link>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(memberRole)}`}>
                          {getRoleIcon(memberRole)}
                          <span className="ml-1 capitalize">{memberRole}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email || "No email"}
                        </span>
                        <span className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          {member.accessLevel}
                        </span>
                      </div>
                    </div>
                    {member.disabled && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        Disabled
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {canManageMembers && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Members
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}