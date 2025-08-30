'use client';
import ProtectedRoute from "@/components/auth/protectedRoute";
import GroupsList from "@/components/groups/groupsList";
import CreateGroupForm from "@/components/groups/createGroupForm";
import { Can } from "@/components/auth/can";
import { useState } from "react";

export default function GroupsPage() {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  return (
    <ProtectedRoute action="read" subject="Group" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Groups</h1>
          <Can I="create" a="Group">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Group
            </button>
          </Can>
        </div>

        {showCreateForm && (
          <div className="mb-6">
            <CreateGroupForm
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <GroupsList />
      </div>
    </ProtectedRoute>
  )
}