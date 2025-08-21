import type { UserDetailsProp } from "@/lib/data/interfaces/user";

export default function UserDetailsPage({ user }: UserDetailsProp) {
  return (
    <div>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {/* Add more user details as needed */}
      <p><strong>Login:</strong> {user.login}</p>
      <p>
        Belongs to groups:
        {/* {user.groups.length > 0 ? (
          <ul>
            {user.groups.map(group => (
              <li key={group.id}>{group.name}</li>
            ))}
          </ul>
        ) : (
          <span>No groups assigned</span>
        )} */}
      </p>
    </div>
  );
}
