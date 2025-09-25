'use client';
import { useState } from "react";
import CreateGroupForm from "@/components/groups/createGroupForm";
import { Can } from "@/components/auth/can";
import { Users } from "lucide-react";

export default function CreateGroupSection() {
  const [showForm, setShowForm] = useState<boolean>(false);

  if (showForm) {
    return (
      <div className="mb-6">
        <CreateGroupForm
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <Can I="create" a="Group">
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Users className="h-4 w-4 mr-2" />
        Create Group
      </button>
    </Can>
  );
}
