import type { AppAbility, Subjects } from "./roles";

export class AbilityChecker {
  private abilities: AppAbility;

  constructor(abilities: AppAbility) {
    this.abilities = abilities;
  }

  canManageObject(subject: any) {
    return this.abilities.can("manage", subject);
  }

  canEditObject(subject: any) {
    return this.abilities.can("update", subject);
  }

  canEditObjectField(subject: any, field?: string) {
    if (!field) return false;
    return this.abilities.can("update", subject, field);
  }

  canCreateObject(subject: Subjects) {
    return this.abilities.can("create", subject);
  }

  canRemoveObject(subject: any) {
    return this.abilities.can("delete", subject);
  }

  canViewObject(subject: any) {
    return this.abilities.can("read", subject);
  }

  canAddtoObject(subject: any) {
    return this.abilities.can("assign", subject);
  }

  canRemoveFromObject(subject: any) {
    return this.abilities.can("remove", subject);
  }
}
