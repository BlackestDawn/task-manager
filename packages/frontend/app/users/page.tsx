import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Task Manager - Users',
  description: 'Display and manage users',
};

export default function UsersPage() {
  return (
    <>
      <h2>Users Page</h2>
      <p>This is the users page content.</p>
    </>
  )
}
