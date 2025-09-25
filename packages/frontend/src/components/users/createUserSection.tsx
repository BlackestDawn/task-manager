'use client';
import { useState } from "react";
import CreateUserForm from "./createUserForm";
import { Can } from "@/components/auth/can";
import { UserPlus } from "lucide-react";

export default function CreateUserSection() {
  const [showForm, setShowForm] = useState<boolean>(false);

  if (showForm) {
    return (
      <div className="mb-6">
        <CreateUserForm
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <Can I="create" a="User">
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </button>
    </Can>
  );
}
