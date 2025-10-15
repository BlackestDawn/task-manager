import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getGroupAction, getGroupMembersAction, getGroupTasksAction } from "@/lib/actions/groups";
import { checkAuthAction } from "@/lib/actions/auth";
import GroupDetailsContent from "@/components/groups/groupDetailsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Task Manager - Group Details',
  description: 'View and manage group details',
};

interface GroupPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = await params;
  if (!id) notFound();

  const { isAuthenticated } = await checkAuthAction();
  if (!isAuthenticated) redirect(`/login?redirect=/groups/${id}`);

  const [group, members, tasks] = await Promise.all([
    getGroupAction(id),
    getGroupMembersAction(id),
    getGroupTasksAction(id),
  ]);

  if (!group) notFound();

  return <GroupDetailsContent group={group} members={members} tasks={tasks} />;
}
