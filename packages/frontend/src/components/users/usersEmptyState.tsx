'use client';
import { User, UserPlus } from "lucide-react";
import { Can } from "@/components/auth/can";

export default function UsersEmptyState() {
  return (
    <div className="text-center py-12">
      <User className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Get started by creating a new user.
      </p>
      <Can I="create" a="User">
        <div className="mt-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </Can>
    </div>
  );
}
