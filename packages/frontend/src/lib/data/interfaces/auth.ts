import type { User, AppAbility } from "@task-manager/common";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ServerAuthState extends AuthState {
  ability: AppAbility | null;
}
