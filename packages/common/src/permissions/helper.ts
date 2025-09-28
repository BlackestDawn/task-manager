import { defineAbilityFor, type AppAbility, type Subjects } from "./roles";
import type { UserContext } from "./types";
import type { User } from "../types/users";

interface StartParams {
  user?: User | UserContext;
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

  canManageObject(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("manage", subject);
  }

  canEditObject(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("update", subject);
  }

  canEditObjectField(subject?: Subjects, field?: string) {
    if (!subject || !field) return false;
    return this.abilities.can("update", subject, field);
  }

  canCreateObject(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("create", subject);
  }

  canDeleteObject(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("delete", subject);
  }

  canViewObject(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("read", subject);
  }

  canAssignTask(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("assignTask", subject);
  }

  canRemoveTask(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("removeTask", subject);
  }

  canAssignUser(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("assignUser", subject);
  }

  canRemoveUser(subject?: Subjects) {
    if (!subject) return false;
    return this.abilities.can("removeUser", subject);
  }
}
