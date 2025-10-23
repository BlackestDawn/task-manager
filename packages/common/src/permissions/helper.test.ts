import { describe, expect, it, beforeEach } from 'vitest';
import { AbilityChecker } from './helper';
import { defineAbilityFor } from './roles';
import type { UserContext } from './types';
import type { User } from '../types/users';

const USER_ID = 'user-id-1';
const OTHER_USER_ID = 'other-user-id';
const GROUP_ID = 'group-id-1';
const OTHER_GROUP_ID = 'other-group-id';

describe('AbilityChecker', () => {
  describe('constructor', () => {
    it('should initialize with an ability parameter', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const ability = defineAbilityFor(userContext);
      const checker = new AbilityChecker({ ability });

      expect(checker).toBeInstanceOf(AbilityChecker);
    });

    it('should initialize with a user parameter', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker).toBeInstanceOf(AbilityChecker);
    });

    it('should initialize with a User type parameter', () => {
      const user: User = {
        __typename: 'User',
        id: USER_ID,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        disabled: false,
        groups: [],
        accessLevel: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const checker = new AbilityChecker({ user });

      expect(checker).toBeInstanceOf(AbilityChecker);
    });

    it('should initialize with null user (no parameters)', () => {
      const checker = new AbilityChecker({});

      expect(checker).toBeInstanceOf(AbilityChecker);
    });
  });

  describe('canManageObject', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canManageObject(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canManageObject(null)).toBe(false);
    });

    it('should return true when user can manage their own task', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', userId: USER_ID };

      expect(checker.canManageObject(task)).toBe(true);
    });

    it('should return false when user cannot manage another user\'s task', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', userId: OTHER_USER_ID };

      expect(checker.canManageObject(task)).toBe(false);
    });

    it('should return true when admin can manage everything', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'admin',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', userId: OTHER_USER_ID };

      expect(checker.canManageObject(task)).toBe(true);
    });
  });

  describe('canEditObject', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canEditObject(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canEditObject(null)).toBe(false);
    });

    it('should return true when user can edit their own user object', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const user = { __typename: 'User', id: USER_ID };

      expect(checker.canEditObject(user)).toBe(true);
    });

    it('should return false when user cannot edit another user object', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const user = { __typename: 'User', id: OTHER_USER_ID };

      expect(checker.canEditObject(user)).toBe(false);
    });

    it('should return true when editor can edit task in their group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'editor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', groups: [{ id: GROUP_ID }] };

      expect(checker.canEditObject(task)).toBe(true);
    });
  });

  describe('canEditObjectField', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canEditObjectField(undefined, 'name')).toBe(false);
    });

    it('should return false when field is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const user = { __typename: 'User', id: USER_ID };

      expect(checker.canEditObjectField(user, undefined)).toBe(false);
    });

    it('should return false when both subject and field are undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canEditObjectField(undefined, undefined)).toBe(false);
    });

    it('should return true when user can edit allowed field on their own object', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const user = { __typename: 'User', id: USER_ID };

      expect(checker.canEditObjectField(user, 'name')).toBe(true);
    });

    it('should return false when user cannot edit forbidden field', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const user = { __typename: 'User', id: USER_ID };

      expect(checker.canEditObjectField(user, 'login')).toBe(false);
    });
  });

  describe('canCreateObject', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canCreateObject(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canCreateObject(null)).toBe(false);
    });

    it('should return true when editor can create task in their group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'editor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', groups: [{ id: GROUP_ID }] };

      expect(checker.canCreateObject(task)).toBe(true);
    });

    it('should return false when viewer cannot create task in their group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'viewer' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', groups: [{ id: GROUP_ID }] };

      expect(checker.canCreateObject(task)).toBe(false);
    });

    it('should return true when manager can create user', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'manager',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canCreateObject('User')).toBe(true);
    });
  });

  describe('canDeleteObject', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canDeleteObject(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canDeleteObject(null)).toBe(false);
    });

    it('should return true when user can delete their own task', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', userId: USER_ID };

      expect(checker.canDeleteObject(task)).toBe(true);
    });

    it('should return false when user cannot delete another user\'s task', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', userId: OTHER_USER_ID };

      expect(checker.canDeleteObject(task)).toBe(false);
    });

    it('should return true when editor can delete incomplete task in their group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'editor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', completed: false, groups: [{ id: GROUP_ID }] };

      expect(checker.canDeleteObject(task)).toBe(true);
    });
  });

  describe('canViewObject', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canViewObject(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canViewObject(null)).toBe(false);
    });

    it('should return true when user can view their own user object', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const user = { __typename: 'User', id: USER_ID };

      expect(checker.canViewObject(user)).toBe(true);
    });

    it('should return true when viewer can view task in their group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'viewer' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', groups: [{ id: GROUP_ID }] };

      expect(checker.canViewObject(task)).toBe(true);
    });

    it('should return false when viewer cannot view task outside their group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'viewer' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const task = { __typename: 'Task', groups: [{ id: OTHER_GROUP_ID }] };

      expect(checker.canViewObject(task)).toBe(false);
    });
  });

  describe('canAssignTask', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canAssignTask(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canAssignTask(null)).toBe(false);
    });

    it('should return true when supervisor can assign task to group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'supervisor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canAssignTask(group)).toBe(true);
    });

    it('should return true when editor can assign task to group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'editor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canAssignTask(group)).toBe(true);
    });

    it('should return false when viewer cannot assign task to group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'viewer' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canAssignTask(group)).toBe(false);
    });
  });

  describe('canRemoveTask', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canRemoveTask(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canRemoveTask(null)).toBe(false);
    });

    it('should return true when supervisor can remove task from group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'supervisor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canRemoveTask(group)).toBe(true);
    });

    it('should return false when editor cannot remove task from group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'editor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canRemoveTask(group)).toBe(false);
    });
  });

  describe('canAssignUser', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canAssignUser(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canAssignUser(null)).toBe(false);
    });

    it('should return true when supervisor can assign user to group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'supervisor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canAssignUser(group)).toBe(true);
    });

    it('should return false when editor cannot assign user to group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'editor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canAssignUser(group)).toBe(false);
    });

    it('should return true when admin can assign user to any group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'admin',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: OTHER_GROUP_ID };

      expect(checker.canAssignUser(group)).toBe(true);
    });
  });

  describe('canRemoveUser', () => {
    it('should return false when subject is undefined', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canRemoveUser(undefined)).toBe(false);
    });

    it('should return false when subject is null', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      expect(checker.canRemoveUser(null)).toBe(false);
    });

    it('should return true when supervisor can remove user from group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'supervisor' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canRemoveUser(group)).toBe(true);
    });

    it('should return false when viewer cannot remove user from group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'viewer' }],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canRemoveUser(group)).toBe(false);
    });

    it('should return true when admin can remove user from any group', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'admin',
      };
      const checker = new AbilityChecker({ user: userContext });
      const group = { __typename: 'Group', id: OTHER_GROUP_ID };

      expect(checker.canRemoveUser(group)).toBe(true);
    });
  });

  describe('edge cases with no user (anonymous)', () => {
    it('should return false for all permission checks when initialized with no user', () => {
      const checker = new AbilityChecker({});
      const task = { __typename: 'Task', userId: USER_ID };
      const user = { __typename: 'User', id: USER_ID };
      const group = { __typename: 'Group', id: GROUP_ID };

      expect(checker.canManageObject(task)).toBe(false);
      expect(checker.canEditObject(task)).toBe(false);
      expect(checker.canEditObjectField(user, 'name')).toBe(false);
      expect(checker.canCreateObject(task)).toBe(false);
      expect(checker.canDeleteObject(task)).toBe(false);
      expect(checker.canViewObject(task)).toBe(false);
      expect(checker.canAssignTask(group)).toBe(false);
      expect(checker.canRemoveTask(group)).toBe(false);
      expect(checker.canAssignUser(group)).toBe(false);
      expect(checker.canRemoveUser(group)).toBe(false);
    });
  });

  describe('integration with multiple group roles', () => {
    it('should properly handle user with multiple group roles', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [
          { id: GROUP_ID, role: 'supervisor' },
          { id: OTHER_GROUP_ID, role: 'viewer' },
        ],
        accessLevel: 'user',
      };
      const checker = new AbilityChecker({ user: userContext });

      const taskInGroup1 = { __typename: 'Task', groups: [{ id: GROUP_ID }] };
      const taskInGroup2 = { __typename: 'Task', groups: [{ id: OTHER_GROUP_ID }] };

      // Should be able to manage tasks in GROUP_ID (supervisor)
      expect(checker.canManageObject(taskInGroup1)).toBe(true);

      // Should only be able to view tasks in OTHER_GROUP_ID (viewer)
      expect(checker.canViewObject(taskInGroup2)).toBe(true);
      expect(checker.canEditObject(taskInGroup2)).toBe(false);
    });
  });
});
