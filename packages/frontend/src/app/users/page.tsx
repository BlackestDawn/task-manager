import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchUsers } from "@/lib/api/user";
import type { UserArrayProp } from "@/lib/data/interfaces/user";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protectedRoute";

export const metadata: Metadata = {
  title: 'Task Manager - Users',
  description: 'Display and manage users',
};

export default async function UsersPageWrapper() {
  const users = await fetchUsers();

  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersPage users={users} />
      </Suspense>
    </ProtectedRoute>
  );
}

function UsersPage(users: UserArrayProp) {
  return (
    <div>
      <h2>Users:</h2>
      <ul>
        {users.users.map(user => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
