import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getUserAction, getUserGroupsAction, getUserTasksAction } from "@/lib/actions/users";
import { checkAuthAction } from "@/lib/actions/auth";
import UserDetailsContent from "@/components/users/userDetailsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Task Manager - User Details',
  description: 'View and manage user details',
};

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  if (!id) notFound();

  const { isAuthenticated } = await checkAuthAction();
  if (!isAuthenticated) redirect(`/login?redirect=/users/${id}`);

  const [user, tasks, groups] = await Promise.all([
    getUserAction(id),
    getUserTasksAction(id),
    getUserGroupsAction(id),
  ]);

  if (!user) notFound();

  return <UserDetailsContent user={user} tasks={tasks} groups={groups} />;
}
