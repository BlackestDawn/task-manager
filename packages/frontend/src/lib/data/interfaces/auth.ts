import type { User, AppAbility } from "@task-manager/common";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  ability: AppAbility;
}
