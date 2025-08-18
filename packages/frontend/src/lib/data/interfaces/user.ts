import type { User } from "@task-manager/common";

export interface UserArrayProp {
  users: User[];
}

export interface UserProp {
  user: User | undefined | null;
}

export interface UserDetailsProp {
  user: User;
}
