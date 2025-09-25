'use client';
import { Can } from "@/components/auth/can";
import { User, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import Link from "next/link";
import type { User as UserType } from "@task-manager/common";

interface UserListItemProps {
  user: UserType;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

function UserStatusBadge({ user }: { user: UserType }) {
  if (user.disabled) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        Disabled
      </span>
    );
  }
  return null;
}

function CurrentUserBadge({ isCurrentUser }: { isCurrentUser: boolean }) {
  if (!isCurrentUser) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      You
    </span>
  );
}

function UserAvatar() {
  return (
    <div className="flex-shrink-0">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
        <User className="h-6 w-6 text-gray-400" />
      </div>
    </div>
  );
}

function UserActions({
  user,
  onDelete,
  isDeleting,
  isCurrentUser
}: {
  user: UserType,
  onDelete: (id: string) => Promise<void>,
  isDeleting: boolean,
  isCurrentUser: boolean
}) {
  return (
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
          onClick={() => onDelete(user.id)}
          disabled={isDeleting || isCurrentUser}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete user"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </button>
      </Can>
    </div>
  );
}

export default function UserListItem({ user, onDelete, isDeleting }: UserListItemProps) {
  const { user: currentUser } = useAuthContext();
  const isCurrentUser = currentUser?.id === user.id;

  return (
    <li className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserAvatar />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name}
              </p>
              <UserStatusBadge user={user} />
              <CurrentUserBadge isCurrentUser={isCurrentUser} />
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

        <UserActions
          user={user}
          onDelete={onDelete}
          isDeleting={isDeleting}
          isCurrentUser={isCurrentUser}
        />
      </div>
    </li>
  );
}
