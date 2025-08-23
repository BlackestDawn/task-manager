import type { AppAbility, Subjects } from "./roles";

export class AbilityChecker {
  private abilities: AppAbility;

  constructor(abilities: AppAbility) {
    this.abilities = abilities;
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

  canRemoveObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("delete", subject);
  }

  canViewObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("read", subject);
  }

  canAddtoObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("assign", subject);
  }

  canRemoveFromObject(subject?: any) {
    if (!subject) return false;
    return this.abilities.can("remove", subject);
  }
}
