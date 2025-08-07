import { subject } from '@casl/ability';
import { describe, expect, it } from 'vitest';
import { defineAbilityFor } from './roles';
import { type UserContext } from './types';

const USER_ID = 'user-id-1';
const GROUP_ID = 'group-id-1';
const OTHER_USER_ID = 'other-user-id';
const OTHER_GROUP_ID = 'other-group-id';

describe('defineAbilityFor', () => {
  describe('for a user with no groups', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [],
    };
    const ability = defineAbilityFor(userContext);

    it('should allow managing their own user object', () => {
      expect(ability.can('read', subject('User', { id: USER_ID } as any))).toBe(true);
      expect(ability.can('update', subject('User', { id: USER_ID } as any))).toBe(true);
    });

    it('should not allow managing other user objects', () => {
      expect(ability.can('read', subject('User', { id: OTHER_USER_ID } as any))).toBe(false);
      expect(ability.can('manage', 'User')).toBe(false);
    });

    it('should allow managing their own tasks', () => {
      expect(ability.can('manage', subject('Task', { userId: USER_ID } as any))).toBe(true);
    });

    it('should not allow managing tasks of others', () => {
      expect(ability.can('manage', subject('Task', { userId: OTHER_USER_ID } as any))).toBe(false);
    });

    it('should not allow any group actions', () => {
      expect(ability.can('manage', 'Group')).toBe(false);
      expect(ability.can('create', 'Group')).toBe(false);
      expect(ability.can('read', 'Group')).toBe(false);
    });
  });

  describe('for a user with "viewer" role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'viewer' }],
    };
    const ability = defineAbilityFor(userContext);

    it('should allow reading tasks within the group', () => {
      expect(ability.can('read', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
    });

    it('should not allow reading tasks outside the group', () => {
      expect(ability.can('read', subject('Task', { groups: { id: OTHER_GROUP_ID }} as any))).toBe(false);
    });

    it('should allow reading the group', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });

    it('should not allow modifying tasks in the group', () => {
      expect(ability.can('update', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(false);
      expect(ability.can('delete', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(false);
      expect(ability.can('markDone', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(false);
    });
  });

  describe('for a user with "user" role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'user' }],
    };
    const ability = defineAbilityFor(userContext);

    it('should allow reading and marking tasks as done within the group', () => {
      expect(ability.can('read', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
      expect(ability.can('markDone', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
    });

    it('should not allow creating, updating, or deleting tasks within the group context', () => {
      expect(ability.can('update', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(false);
      expect(ability.can('delete', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(false);
    });

    it('should allow reading the group', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });
  });

  describe('for a user with "editor" role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'editor' }],
    };
    const ability = defineAbilityFor(userContext);

    it('should allow CRUD operations on tasks within the group', () => {
      expect(ability.can('create', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
      expect(ability.can('read', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
      expect(ability.can('update', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
      expect(ability.can('delete', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
    });

    it('should not allow deleting a completed task', () => {
      expect(ability.can('delete', subject('Task', { groups: { id: GROUP_ID, completed: false }} as any))).toBe(true);
      expect(ability.cannot('delete', subject('Task', { groups: { id: GROUP_ID, completed: true }} as any))).toBe(true);
    });

    it('should allow reading the group', () => {
      expect(ability.can('read', 'Group')).toBe(true);
    });
  });

  describe('for a user with "manager" role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'manager' }],
    };
    const ability = defineAbilityFor(userContext);

    it('should allow managing tasks within the group', () => {
      expect(ability.can('manage', subject('Task', { groups: { id: GROUP_ID }} as any))).toBe(true);
    });

    it('should allow managing the group itself, except for creation and deletion', () => {
      expect(ability.can('assign', subject('Group', { id: GROUP_ID } as any))).toBe(true);
      expect(ability.can('remove', subject('Group', { id: GROUP_ID } as any))).toBe(true);
      expect(ability.can('update', subject('Group', { id: GROUP_ID } as any))).toBe(true);
      expect(ability.can('read', 'Group')).toBe(true);
      expect(ability.can('delete', 'Group')).toBe(false);
      expect(ability.can('create', 'Group')).toBe(false);
    });

    it('should allow updating specific fields on users within the group', () => {
      const userInGroup = { groups: { id: GROUP_ID }} as any;
      expect(ability.can('update', subject('User', userInGroup), 'disabled')).toBe(true);
      expect(ability.can('update', subject('User', userInGroup), 'name')).toBe(true);
      expect(ability.can('update', subject('User', userInGroup), 'email')).toBe(true);
      expect(ability.can('update', subject('User', userInGroup), 'password')).toBe(false);
    });
  });

  describe('for a user with "admin" role', () => {
    const userContext: UserContext = {
      id: USER_ID,
      groups: [{ id: GROUP_ID, role: 'admin' }],
    };
    const ability = defineAbilityFor(userContext);

    it('should allow managing everything', () => {
      expect(ability.can('manage', 'all')).toBe(true);
    });
  });
});