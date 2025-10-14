import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAuthAction } from "@/lib/actions/auth";
import { getGroupsAction } from "@/lib/actions/groups";
import GroupsList from "@/components/groups/groupsList";

export const metadata: Metadata = {
  title: "Task Managers - Groups",
  description: "Manage groups and team collaboration",
}

export default async function GroupsPage() {
  const { isAuthenticated } = await checkAuthAction();

  if (!isAuthenticated) redirect("/login?redirect=/groups");

  const groups = await getGroupsAction();

  return <GroupsList groups={groups} />
}
