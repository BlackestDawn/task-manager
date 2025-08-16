import GroupDetailsPage from "@/components/pages/groups/groupDetails";
import type { IDParamProp } from "@/lib/data/interfaces/general";
import type { GroupProp } from "@/lib/data/interfaces/group";
import { fetchGroupById } from "@/lib/api/group";
import { Suspense } from "react";

export async function generateMetadata({ params }: IDParamProp) {
  const group = await fetchGroupById(params.id);

  if (!group) {
    return {
      title: 'Group Not Found',
      description: 'The requested group does not exist.',
    };
  }

  return {
    title: `Task Manager - Group ${group.name}`,
    description: `Details for group ${group.name}`,
  };
}

export default async function GroupDetailsPageWrapper({ params }: IDParamProp) {
  const { id } = await params;
  const group = await fetchGroupById(id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GroupPage group={group} />
    </Suspense>
  );
}

function GroupPage({ group }: GroupProp) {
  if (!group) {
    return <div>Group not found.</div>;
  }

  return (
    <div>
      <h2>Group Details:</h2>
      <GroupDetailsPage group={group} />
    </div>
  );
}
