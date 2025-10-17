import type { UserRole } from "@task-manager/common";
import { Briefcase, Crown, Users } from "lucide-react";

interface UserAccesslevelBadgeProps {
  accessLevel: UserRole;
}

export default function UserAccesslevelBadge({ accessLevel }: UserAccesslevelBadgeProps) {
  if (accessLevel === "admin") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        <Crown className="h-3 w-3 mr-1" />
        Admin
      </span>
    );
  }
  if (accessLevel === "manager") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <Briefcase className="h-3 w-3 mr-1" />
        Manager
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Users className="h-3 w-3 mr-1" />
      User
    </span>
  );
}