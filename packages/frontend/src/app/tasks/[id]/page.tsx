import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getTaskAction, getTaskGroupsAction } from "@/lib/actions/tasks";
import { checkAuthAction } from "@/lib/actions/auth";
import TaskDetailsContent from "@/components/tasks/taskDetailsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Task Manager - Task Details',
  description: 'View and manage task details',
};

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;
  if (!id) notFound();

  const { isAuthenticated } = await checkAuthAction();
  if (!isAuthenticated) redirect(`/login?redirect=/tasks/${id}`);
  const [task, groups] = await Promise.all([
    getTaskAction(id),
    getTaskGroupsAction(id),
  ]);

  if (!task) notFound();

  return <TaskDetailsContent task={task} groups={groups} />;
}
