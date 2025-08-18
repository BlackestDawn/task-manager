import type { GroupDetailProp } from "@/lib/data/interfaces/group";

export default function GroupDetailsPage({ group }: GroupDetailProp) {
  return (
    <div>
      <p>Name: {group.name}</p>
      <p>Description: {group.description}</p>
      {/* Add more group details as needed */}
    </div>
  );
}
