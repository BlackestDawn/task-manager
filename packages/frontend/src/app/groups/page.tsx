import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Task Manager - Groups',
  description: 'Display and manage user groups',
};

export default function GroupsPage() {
  return (
    <div>
      <h2>Groups Page</h2>
      <p>This is the groups page where you can see and manage your groups.</p>
      {/* Add more content or components related to groups here */}
    </div>
  );
}
