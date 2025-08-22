import type { IDParamProp } from "@/lib/data/interfaces/general";

/* export async function generateMetadata({ params }: IDParamProp) {
  const user = await fetchUserById(params.id);

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'The requested user does not exist.',
    };
  }

  return {
    title: `Task Manager - User ${user.name}`,
    description: `Details for user ${user.name}`,
  };
} */

export default async function UserDetailsPage({ params }: IDParamProp) {
  return null;
}
