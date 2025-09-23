import { defineAbilityFor, type AppAbility, type Subjects } from "./roles";
import type { User } from "../types/users";

interface StartParams {
  user?: User;
  ability?: AppAbility;
}


export class AbilityChecker {
  private abilities: AppAbility;

  constructor(params: StartParams ) {
    if (params.ability) {
      this.abilities = params.ability;
      return;
    }

    if (params.user) {
      this.abilities = defineAbilityFor(params.user);
      return;
    }

    this.abilities = defineAbilityFor(null);
  }

  canManageObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("manage", subject);
  }

  canEditObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("update", subject);
  }

  canEditObjectField(subject?: any, field?: string) {
    if (!subject || !field) return false;
    return this.abilities.can("update", subject, field);
  }

  canCreateObject(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("create", subject);
  }

  canDeleteObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("delete", subject);
  }

  canViewObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("read", subject);
  }

  canAssignTask(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("assignTask", subject);
  }

  canRemoveTask(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("removeTask", subject);
  }

  canAssignUser(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("assignUser", subject);
  }

  canRemoveUser(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("removeUser", subject);
  }
}
