import { AbilityChecker, type UserContext } from "@task-manager/common";

// Real AbilityChecker/defineAbilityFor wiring, not a mock — handler tests
// that stub out canXxxObject() would never catch a permission-string bug
// like passing "task" where the rules expect "Task".
export function makeAbilities(userContext: Partial<UserContext> & Pick<UserContext, "id">) {
  return new AbilityChecker({
    user: {
      groups: [],
      accessLevel: "user",
      ...userContext,
    },
  });
}
