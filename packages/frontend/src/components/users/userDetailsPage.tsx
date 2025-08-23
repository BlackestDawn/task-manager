'use client';
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/api/users/queries";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import UserDetailsView from "./userDetailsView";
import UserEditForm from "./userEditForm";
import { ArrowLeft, Edit, User as UserIcon } from "lucide-react";
import LoadingSpinner from "@/components/general/loadingSpinner";

interface UserDetailsPageProps {
  userId: string;
}

export default function UserDetailsPage({ userId }: UserDetailsPageProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { data: user, isLoading, error } = useUser(userId);
  const { canEditUser } = useUserPermissions();

  const canEdit = canEditUser(user);

  if (isLoading) return <LoadingSpinner />;

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">User not found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The user you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <div className="mt-6">
            <Link
              href="/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/users"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Users
            </Link>
          </div>

          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </button>
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            @{user.login}
          </p>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <UserEditForm
          user={user}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <UserDetailsView user={user} />
      )}
    </div>
  );
}