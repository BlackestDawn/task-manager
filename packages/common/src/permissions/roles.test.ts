import { subject } from '@casl/ability';
import { describe, expect, it } from 'vitest';
import { defineAbilityFor } from './roles';
import { type UserContext } from './types';

const USER_ID = 'user-id-1';
const GROUP_ID = 'group-id-1';
const OTHER_USER_ID = 'other-user-id';
const OTHER_GROUP_ID = 'other-group-id';

describe('defineAbilityFor', () => {
  describe('for a null user', () => {
    const ability = defineAbilityFor(null);

    it('should not allow any actions', () => {
      expect(ability.can('read', 'User')).toBe(false);
      expect(ability.can('manage', 'Task')).toBe(false);
      expect(ability.can('read', 'Group')).toBe(false);
    });
  });

  describe('for a user with no groups and no access level (default user)', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [],
      accessLevel: 'user',
    };
    const ability = defineAbilityFor(userContext);
    const userItem: any = { __typename: 'User', id: USER_ID };
    const userOther: any = { __typename: 'User', id: OTHER_USER_ID };
    const taskItem: any = { __typename: 'Task', userId: USER_ID };
    const taskOther: any = { __typename: 'Task', userId: OTHER_USER_ID };

    it('should allow reading their own user object', () => {
      expect(ability.can('read', userItem)).toBe(true);
    });

    it('should allow updating their own user object', () => {
      expect(ability.can('update', userItem)).toBe(true);
    });

    it('should not allow updating login field', () => {
      expect(ability.can('update', userItem, 'login')).toBe(false);
    });

    it('should allow reading all users', () => {
      expect(ability.can('read', 'User')).toBe(true);
    });

    it('should allow reading other user objects', () => {
      expect(ability.can('read', userOther)).toBe(true);
    });

    it('should not allow managing other user objects', () => {
      expect(ability.can('update', userOther)).toBe(false);
      expect(ability.can('delete', userOther)).toBe(false);
      expect(ability.can('manage', 'User')).toBe(false);
    });

    it('should allow managing their own tasks', () => {
      expect(ability.can('manage', taskItem)).toBe(true);
      expect(ability.can('create', taskItem)).toBe(true);
      expect(ability.can('read', taskItem)).toBe(true);
      expect(ability.can('update', taskItem)).toBe(true);
      expect(ability.can('delete', taskItem)).toBe(true);
    });

    it('should not allow managing tasks of others', () => {
      expect(ability.can('manage', taskOther)).toBe(false);
      expect(ability.can('read', taskOther)).toBe(false);
      expect(ability.can('update', taskOther)).toBe(false);
    });

    it('should allow reading groups', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });

    it('should not allow creating or managing groups', () => {
      expect(ability.can('create', 'Group')).toBe(false);
      expect(ability.can('manage', 'Group')).toBe(false);
    });
  });

  describe('for a user with "viewer" group role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'viewer' }],
      accessLevel: 'user',
    };
    const ability = defineAbilityFor(userContext);
    const taskInGroup: any = { __typename: 'Task', groups: [{ id: GROUP_ID }] };
    const taskOutsideGroup: any = { __typename: 'Task', groups: [{ id: OTHER_GROUP_ID }] };
    const ownTask: any = { __typename: 'Task', userId: USER_ID };

    it('should allow reading tasks within the group', () => {
      expect(ability.can('read', taskInGroup)).toBe(true);
    });

    it('should allow reading the group', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });

    it('should not allow modifying tasks in the group', () => {
      expect(ability.can('update', taskInGroup)).toBe(false);
      expect(ability.can('delete', taskInGroup)).toBe(false);
      expect(ability.can('markDone', taskInGroup)).toBe(false);
      expect(ability.can('create', taskInGroup)).toBe(false);
    });

    it('should not allow reading tasks outside the group', () => {
      expect(ability.can('read', taskOutsideGroup)).toBe(false);
    });

    it('should still allow managing own tasks', () => {
      expect(ability.can('manage', ownTask)).toBe(true);
    });
  });

  describe('for a user with "user" group role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'user' }],
      accessLevel: 'user',
    };
    const ability = defineAbilityFor(userContext);
    const taskInGroup: any = { __typename: 'Task', groups: [{ id: GROUP_ID }] };
    const ownTask: any = { __typename: 'Task', userId: USER_ID };

    it('should allow reading tasks within the group', () => {
      expect(ability.can('read', taskInGroup)).toBe(true);
    });

    it('should allow marking tasks as done within the group', () => {
      expect(ability.can('markDone', taskInGroup)).toBe(true);
    });

    it('should not allow creating, updating, or deleting tasks within the group', () => {
      expect(ability.can('create', taskInGroup)).toBe(false);
      expect(ability.can('update', taskInGroup)).toBe(false);
      expect(ability.can('delete', taskInGroup)).toBe(false);
    });

    it('should allow reading the group', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });

    it('should still allow managing own tasks', () => {
      expect(ability.can('manage', ownTask)).toBe(true);
    });
  });

  describe('for a user with "editor" group role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'editor' }],
      accessLevel: 'user',
    };
    const ability = defineAbilityFor(userContext);
    const taskInGroup: any = { __typename: 'Task', completed: false, groups: [{ id: GROUP_ID }] };
    const completedTask: any = { __typename: 'Task', completed: true, groups: [{ id: GROUP_ID }] };
    const ownCompletedTask: any = { __typename: 'Task', completed: true, userId: USER_ID, groups: [{ id: GROUP_ID }] };
    const groupItem: any = { __typename: 'Group', id: GROUP_ID };

    it('should allow CRUD operations on tasks within the group', () => {
      expect(ability.can('create', taskInGroup)).toBe(true);
      expect(ability.can('read', taskInGroup)).toBe(true);
      expect(ability.can('update', taskInGroup)).toBe(true);
      expect(ability.can('delete', taskInGroup)).toBe(true);
      expect(ability.can('markDone', taskInGroup)).toBe(true);
    });

    it('should not allow deleting a completed task unless it is their own', () => {
      expect(ability.can('delete', subject('Task', taskInGroup))).toBe(true);
      expect(ability.cannot('delete', subject('Task', completedTask))).toBe(true);
      expect(ability.can('delete', subject('Task', ownCompletedTask))).toBe(true);
    });

    it('should allow assigning tasks to the group', () => {
      expect(ability.can('assignTask', groupItem)).toBe(true);
    });

    it('should allow reading the group', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });

    it('should not allow other group management actions', () => {
      expect(ability.can('update', groupItem)).toBe(false);
      expect(ability.can('assignUser', groupItem)).toBe(false);
      expect(ability.can('removeUser', groupItem)).toBe(false);
      expect(ability.can('removeTask', groupItem)).toBe(false);
    });
  });

  describe('for a user with "supervisor" group role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'supervisor' }],
      accessLevel: 'user',
    };
    const ability = defineAbilityFor(userContext);
    const userInGroup: any = { __typename: 'User', id: OTHER_USER_ID, groups: [{ id: GROUP_ID }] };
    const taskInGroup: any = { __typename: 'Task', groups: [{ id: GROUP_ID }] };
    const groupItem: any = { __typename: 'Group', id: GROUP_ID };

    it('should allow managing tasks within the group', () => {
      expect(ability.can('manage', taskInGroup)).toBe(true);
      expect(ability.can('create', taskInGroup)).toBe(true);
      expect(ability.can('read', taskInGroup)).toBe(true);
      expect(ability.can('update', taskInGroup)).toBe(true);
      expect(ability.can('delete', taskInGroup)).toBe(true);
    });

    it('should allow managing the group itself', () => {
      expect(ability.can('assignTask', groupItem)).toBe(true);
      expect(ability.can('removeTask', groupItem)).toBe(true);
      expect(ability.can('assignUser', groupItem)).toBe(true);
      expect(ability.can('removeUser', groupItem)).toBe(true);
      expect(ability.can('update', groupItem)).toBe(true);
      expect(ability.can('read', 'Group')).toBe(true);
    });

    it('should not allow creating or deleting groups', () => {
      expect(ability.can('delete', 'Group')).toBe(false);
      expect(ability.can('create', 'Group')).toBe(false);
    });

    it('should allow reading users in the group', () => {
      expect(ability.can('read', userInGroup)).toBe(true);
    });

    it('should not allow managing users', () => {
      expect(ability.can('update', userInGroup)).toBe(false);
      expect(ability.can('delete', userInGroup)).toBe(false);
      expect(ability.can('create', 'User')).toBe(false);
    });
  });

  describe('for a user with "none" group role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'none' }],
      accessLevel: 'user',
    };
    const ability = defineAbilityFor(userContext);
    const taskInGroup: any = { __typename: 'Task', groups: [{ id: GROUP_ID }] };
    const ownTask: any = { __typename: 'Task', userId: USER_ID };
    const groupItem: any = { __typename: 'Group', id: GROUP_ID };

    it('should not allow any group-related task actions', () => {
      expect(ability.can('read', taskInGroup)).toBe(false);
      expect(ability.can('manage', taskInGroup)).toBe(false);
    });

    it('should not allow any group management actions', () => {
      expect(ability.can('manage', groupItem)).toBe(false);
      expect(ability.can('update', groupItem)).toBe(false);
      expect(ability.can('assignTask', groupItem)).toBe(false);
    });

    it('should still allow managing own tasks', () => {
      expect(ability.can('manage', ownTask)).toBe(true);
    });

    it('should allow reading groups', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });
  });

  describe('for a user with "manager" access level', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [],
      accessLevel: 'manager',
    };
    const ability = defineAbilityFor(userContext);
    const userItem: any = { __typename: 'User', id: OTHER_USER_ID };
    const groupItem: any = { __typename: 'Group', id: GROUP_ID };

    it('should allow managing all groups', () => {
      expect(ability.can('manage', 'Group')).toBe(true);
      expect(ability.can('create', 'Group')).toBe(true);
      expect(ability.can('update', groupItem)).toBe(true);
      expect(ability.can('delete', groupItem)).toBe(true);
    });

    it('should allow creating users', () => {
      expect(ability.can('create', 'User')).toBe(true);
    });

    it('should allow updating specific user fields', () => {
      expect(ability.can('update', userItem, 'disabled')).toBe(true);
      expect(ability.can('update', userItem, 'name')).toBe(true);
      expect(ability.can('update', userItem, 'email')).toBe(true);
      expect(ability.can('update', userItem, 'password')).toBe(true);
    });

    it('should not allow updating login field', () => {
      expect(ability.can('update', userItem, 'login')).toBe(false);
    });

    it('should allow deleting users', () => {
      expect(ability.can('delete', 'User')).toBe(true);
      expect(ability.can('delete', userItem)).toBe(true);
    });

    it('should not have full manage access to all', () => {
      expect(ability.can('manage', 'all')).toBe(false);
    });
  });

  describe('for a user with "admin" access level', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [],
      accessLevel: 'admin',
    };
    const ability = defineAbilityFor(userContext);

    it('should allow managing everything', () => {
      expect(ability.can('manage', 'all')).toBe(true);
    });

    it('should allow all actions on all subjects', () => {
      expect(ability.can('create', 'User')).toBe(true);
      expect(ability.can('delete', 'User')).toBe(true);
      expect(ability.can('manage', 'Group')).toBe(true);
      expect(ability.can('manage', 'Task')).toBe(true);
    });
  });

  describe('for a user with multiple group roles', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [
        { id: GROUP_ID, role: 'supervisor' },
        { id: OTHER_GROUP_ID, role: 'viewer' },
      ],
      accessLevel: 'user',
    };
    const ability = defineAbilityFor(userContext);
    const taskInGroup1: any = { __typename: 'Task', groups: [{ id: GROUP_ID }] };
    const taskInGroup2: any = { __typename: 'Task', groups: [{ id: OTHER_GROUP_ID }] };

    it('should have supervisor permissions in first group', () => {
      expect(ability.can('manage', taskInGroup1)).toBe(true);
    });

    it('should have viewer permissions in second group', () => {
      expect(ability.can('read', taskInGroup2)).toBe(true);
      expect(ability.can('update', taskInGroup2)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle tasks with multiple groups correctly', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'editor' }],
        accessLevel: 'user',
      };
      const ability = defineAbilityFor(userContext);
      const taskWithMultipleGroups: any = {
        __typename: 'Task',
        groups: [{ id: GROUP_ID }, { id: OTHER_GROUP_ID }],
      };

      // Should have access if they're in at least one of the groups
      expect(ability.can('read', taskWithMultipleGroups)).toBe(true);
    });

    it('should properly detect subject types using __typename', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [],
        accessLevel: 'user',
      };
      const ability = defineAbilityFor(userContext);
      const taskWithTypename: any = { __typename: 'Task', userId: USER_ID };
      const taskWithType: any = { type: 'Task', userId: USER_ID };

      expect(ability.can('manage', taskWithTypename)).toBe(true);
      expect(ability.can('manage', taskWithType)).toBe(true);
    });

    it('should combine group role and user access level permissions', () => {
      const userContext: UserContext = {
        id: USER_ID,
        groups: [{ id: GROUP_ID, role: 'viewer' }],
        accessLevel: 'manager',
      };
      const ability = defineAbilityFor(userContext);

      // Manager permissions should allow managing groups
      expect(ability.can('manage', 'Group')).toBe(true);
      // Viewer permissions in specific group should still apply
      const taskInGroup: any = { __typename: 'Task', groups: [{ id: GROUP_ID }] };
      expect(ability.can('read', taskInGroup)).toBe(true);
    });
  });
});
