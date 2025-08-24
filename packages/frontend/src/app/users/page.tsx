'use client';
import UsersList from "@/components/users/usersList";
import CreateUserForm from "@/components/users/createUserForm";
import ProtectedRoute from "@/components/auth/protectedRoute";
import { Can } from "@/components/auth/can";
import { useState } from "react";

export default function UsersPage() {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  return (
    <ProtectedRoute action="read" subject="User">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <Can I="create" a="User">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add User
            </button>
          </Can>
        </div>

        {showCreateForm && (
          <div className="mb-6">
            <CreateUserForm
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <UsersList />
      </div>
    </ProtectedRoute>
  )
}