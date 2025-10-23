import { describe, it, expect } from "vitest";
import {
  validateGroup,
  validateGroupArray,
  validateCreateGroupRequest,
  validateUpdateGroupRequest,
  validateAddUserToGroupRequest,
  validateRemoveUserFromGroupRequest,
  validateAssignTaskToGroupRequest,
  validateRemoveTaskFromGroupRequest,
  validateGroupMember,
  validateGroupMemberArray,
  validateGroupTask,
  validateGroupTaskArray,
  type Group,
  type CreateGroupRequest,
} from "./groups";

describe("validateGroup", () => {
  const validGroup: Group = {
    __typename: "Group",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    name: "Test Group",
    description: "Test description",
  };

  it("should validate a valid group object", () => {
    const result = validateGroup(validGroup);
    expect(result).toBeDefined();
    expect(result.id).toBe(validGroup.id);
    expect(result.name).toBe(validGroup.name);
  });

  it("should add default __typename", () => {
    const groupWithoutTypename = { ...validGroup };
    delete (groupWithoutTypename as any).__typename;
    const result = validateGroup(groupWithoutTypename);
    expect(result.__typename).toBe("Group");
  });

  it("should handle null description", () => {
    const groupWithNullDesc = { ...validGroup, description: null };
    const result = validateGroup(groupWithNullDesc);
    expect(result.description).toBeNull();
  });

  it("should handle undefined description and default to null", () => {
    const { description, ...groupWithoutDesc } = validGroup;
    const result = validateGroup(groupWithoutDesc);
    expect(result.description).toBeNull();
  });

  it("should coerce string dates to Date objects", () => {
    const groupWithStringDates = {
      ...validGroup,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    };
    const result = validateGroup(groupWithStringDates);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("should throw error for invalid UUID", () => {
    const invalidGroup = { ...validGroup, id: "not-a-uuid" };
    expect(() => validateGroup(invalidGroup)).toThrow("Invalid group");
  });

  it("should throw error for missing required field", () => {
    const { name, ...groupWithoutName } = validGroup;
    expect(() => validateGroup(groupWithoutName)).toThrow("Invalid group");
  });

  it("should throw error for empty name", () => {
    const invalidGroup = { ...validGroup, name: "" };
    expect(() => validateGroup(invalidGroup)).toThrow("Invalid group");
  });
});

describe("validateGroupArray", () => {
  const group1: Group = {
    __typename: "Group",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Group 1",
    description: "First group",
  };

  const group2: Group = {
    __typename: "Group",
    id: "223e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Group 2",
    description: null,
  };

  it("should validate an array of valid groups", () => {
    const result = validateGroupArray([group1, group2]);
    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe("Group 1");
    expect(result[1]!.name).toBe("Group 2");
  });

  it("should validate an empty array", () => {
    const result = validateGroupArray([]);
    expect(result).toEqual([]);
  });

  it("should throw error if one group is invalid", () => {
    const invalidGroups = [group1, { ...group2, id: "not-a-uuid" }];
    expect(() => validateGroupArray(invalidGroups)).toThrow("Invalid group array");
  });
});

describe("validateCreateGroupRequest", () => {
  const validRequest: CreateGroupRequest = {
    name: "New Group",
    description: "Group description",
  };

  it("should validate a valid create group request", () => {
    const result = validateCreateGroupRequest(validRequest);
    expect(result.name).toBe(validRequest.name);
    expect(result.description).toBe(validRequest.description);
  });

  it("should handle null description", () => {
    const requestWithNullDesc = { ...validRequest, description: null };
    const result = validateCreateGroupRequest(requestWithNullDesc);
    expect(result.description).toBeNull();
  });

  it("should handle undefined description and default to null", () => {
    const { description, ...requestWithoutDesc } = validRequest;
    const result = validateCreateGroupRequest(requestWithoutDesc);
    expect(result.description).toBeNull();
  });

  it("should throw error for missing name", () => {
    const { name, ...requestWithoutName } = validRequest;
    expect(() => validateCreateGroupRequest(requestWithoutName)).toThrow(
      "Invalid create group request"
    );
  });

  it("should throw error for empty name", () => {
    const invalidRequest = { ...validRequest, name: "" };
    expect(() => validateCreateGroupRequest(invalidRequest)).toThrow(
      "Invalid create group request"
    );
  });
});

describe("validateUpdateGroupRequest", () => {
  const validRequest = {
    name: "Updated Group",
    description: "Updated description",
  };

  it("should validate a valid update group request", () => {
    const result = validateUpdateGroupRequest(validRequest);
    expect(result.name).toBe(validRequest.name);
    expect(result.description).toBe(validRequest.description);
  });

  it("should handle null description", () => {
    const requestWithNullDesc = { ...validRequest, description: null };
    const result = validateUpdateGroupRequest(requestWithNullDesc);
    expect(result.description).toBeNull();
  });

  it("should throw error for missing name", () => {
    const { name, ...requestWithoutName } = validRequest;
    expect(() => validateUpdateGroupRequest(requestWithoutName)).toThrow(
      "Invalid update group request"
    );
  });
});

describe("validateAddUserToGroupRequest", () => {
  const validRequest = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    role: "user" as const,
  };

  it("should validate a valid add user request", () => {
    const result = validateAddUserToGroupRequest(validRequest);
    expect(result.userId).toBe(validRequest.userId);
    expect(result.role).toBe(validRequest.role);
  });

  it("should apply default role", () => {
    const { role, ...requestWithoutRole } = validRequest;
    const result = validateAddUserToGroupRequest(requestWithoutRole);
    expect(result.role).toBe("user");
  });

  it("should handle all valid roles", () => {
    const roles = ["supervisor", "editor", "user", "viewer", "none"] as const;
    roles.forEach((role) => {
      const request = { ...validRequest, role };
      const result = validateAddUserToGroupRequest(request);
      expect(result.role).toBe(role);
    });
  });

  it("should throw error for missing userId", () => {
    const { userId, ...requestWithoutUserId } = validRequest;
    expect(() => validateAddUserToGroupRequest(requestWithoutUserId)).toThrow(
      "Invalid add user to group request"
    );
  });

  it("should throw error for invalid userId UUID", () => {
    const invalidRequest = { ...validRequest, userId: "not-a-uuid" };
    expect(() => validateAddUserToGroupRequest(invalidRequest)).toThrow(
      "Invalid add user to group request"
    );
  });

  it("should throw error for invalid role", () => {
    const invalidRequest = { ...validRequest, role: "owner" };
    expect(() => validateAddUserToGroupRequest(invalidRequest)).toThrow(
      "Invalid add user to group request"
    );
  });
});

describe("validateRemoveUserFromGroupRequest", () => {
  const validRequest = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
  };

  it("should validate a valid remove user request", () => {
    const result = validateRemoveUserFromGroupRequest(validRequest);
    expect(result.userId).toBe(validRequest.userId);
  });

  it("should throw error for missing userId", () => {
    expect(() => validateRemoveUserFromGroupRequest({})).toThrow(
      "Invalid remove user from group request"
    );
  });

  it("should throw error for invalid userId UUID", () => {
    const invalidRequest = { userId: "not-a-uuid" };
    expect(() => validateRemoveUserFromGroupRequest(invalidRequest)).toThrow(
      "Invalid remove user from group request"
    );
  });
});

describe("validateAssignTaskToGroupRequest", () => {
  const validRequest = {
    taskId: "123e4567-e89b-12d3-a456-426614174000",
    assignedBy: "223e4567-e89b-12d3-a456-426614174000",
  };

  it("should validate a valid assign task request", () => {
    const result = validateAssignTaskToGroupRequest(validRequest);
    expect(result.taskId).toBe(validRequest.taskId);
    expect(result.assignedBy).toBe(validRequest.assignedBy);
  });

  it("should throw error for missing taskId", () => {
    const { taskId, ...requestWithoutTaskId } = validRequest;
    expect(() => validateAssignTaskToGroupRequest(requestWithoutTaskId)).toThrow(
      "Invalid assign task to group request"
    );
  });

  it("should throw error for missing assignedBy", () => {
    const { assignedBy, ...requestWithoutAssignedBy } = validRequest;
    expect(() =>
      validateAssignTaskToGroupRequest(requestWithoutAssignedBy)
    ).toThrow("Invalid assign task to group request");
  });

  it("should throw error for invalid taskId UUID", () => {
    const invalidRequest = { ...validRequest, taskId: "not-a-uuid" };
    expect(() => validateAssignTaskToGroupRequest(invalidRequest)).toThrow(
      "Invalid assign task to group request"
    );
  });

  it("should throw error for invalid assignedBy UUID", () => {
    const invalidRequest = { ...validRequest, assignedBy: "not-a-uuid" };
    expect(() => validateAssignTaskToGroupRequest(invalidRequest)).toThrow(
      "Invalid assign task to group request"
    );
  });
});

describe("validateRemoveTaskFromGroupRequest", () => {
  const validRequest = {
    taskId: "123e4567-e89b-12d3-a456-426614174000",
  };

  it("should validate a valid remove task request", () => {
    const result = validateRemoveTaskFromGroupRequest(validRequest);
    expect(result.taskId).toBe(validRequest.taskId);
  });

  it("should throw error for missing taskId", () => {
    expect(() => validateRemoveTaskFromGroupRequest({})).toThrow(
      "Invalid remove task from group request"
    );
  });

  it("should throw error for invalid taskId UUID", () => {
    const invalidRequest = { taskId: "not-a-uuid" };
    expect(() => validateRemoveTaskFromGroupRequest(invalidRequest)).toThrow(
      "Invalid remove task from group request"
    );
  });
});

describe("validateGroupMember", () => {
  const validMember = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "John Doe",
    login: "johndoe",
    email: "john@example.com",
    role: "user" as const,
    disabled: false,
  };

  it("should validate a valid group member", () => {
    const result = validateGroupMember(validMember);
    expect(result.id).toBe(validMember.id);
    expect(result.name).toBe(validMember.name);
    expect(result.role).toBe(validMember.role);
  });

  it("should handle null email", () => {
    const memberWithNullEmail = { ...validMember, email: null };
    const result = validateGroupMember(memberWithNullEmail);
    expect(result.email).toBeNull();
  });

  it("should apply default disabled value", () => {
    const { disabled, ...memberWithoutDisabled } = validMember;
    const result = validateGroupMember(memberWithoutDisabled);
    expect(result.disabled).toBe(false);
  });

  it("should handle all valid roles", () => {
    const roles = ["supervisor", "editor", "user", "viewer", "none"] as const;
    roles.forEach((role) => {
      const member = { ...validMember, role };
      const result = validateGroupMember(member);
      expect(result.role).toBe(role);
    });
  });

  it("should throw error for invalid UUID", () => {
    const invalidMember = { ...validMember, id: "not-a-uuid" };
    expect(() => validateGroupMember(invalidMember)).toThrow("Invalid group member");
  });

  it("should throw error for invalid role", () => {
    const invalidMember = { ...validMember, role: "owner" };
    expect(() => validateGroupMember(invalidMember)).toThrow("Invalid group member");
  });
});

describe("validateGroupMemberArray", () => {
  const member1 = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "John Doe",
    login: "johndoe",
    email: "john@example.com",
    role: "user" as const,
    disabled: false,
  };

  const member2 = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    name: "Jane Smith",
    login: "janesmith",
    email: null,
    role: "editor" as const,
    disabled: true,
  };

  it("should validate an array of valid members", () => {
    const result = validateGroupMemberArray([member1, member2]);
    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe("John Doe");
    expect(result[1]!.name).toBe("Jane Smith");
  });

  it("should validate an empty array", () => {
    const result = validateGroupMemberArray([]);
    expect(result).toEqual([]);
  });

  it("should throw error if one member is invalid", () => {
    const invalidMembers = [member1, { ...member2, id: "not-a-uuid" }];
    expect(() => validateGroupMemberArray(invalidMembers)).toThrow(
      "Invalid group member array"
    );
  });
});

describe("validateGroupTask", () => {
  const validTask = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Task Title",
    description: "Task description",
    completed: false,
    userId: "223e4567-e89b-12d3-a456-426614174000",
    userName: "John Doe",
    finishBy: new Date("2024-12-31"),
    completedAt: null,
  };

  it("should validate a valid group task", () => {
    const result = validateGroupTask(validTask);
    expect(result.id).toBe(validTask.id);
    expect(result.title).toBe(validTask.title);
    expect(result.userName).toBe(validTask.userName);
  });

  it("should handle null description", () => {
    const taskWithNullDesc = { ...validTask, description: null };
    const result = validateGroupTask(taskWithNullDesc);
    expect(result.description).toBeNull();
  });

  it("should handle null finishBy", () => {
    const taskWithNullFinishBy = { ...validTask, finishBy: null };
    const result = validateGroupTask(taskWithNullFinishBy);
    expect(result.finishBy).toBeNull();
  });

  it("should handle completed task with completedAt", () => {
    const completedTask = {
      ...validTask,
      completed: true,
      completedAt: new Date("2024-01-15"),
    };
    const result = validateGroupTask(completedTask);
    expect(result.completed).toBe(true);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it("should coerce string dates to Date objects", () => {
    const taskWithStringDates = {
      ...validTask,
      finishBy: "2024-12-31T00:00:00Z",
      completedAt: "2024-01-15T00:00:00Z",
    };
    const result = validateGroupTask(taskWithStringDates);
    expect(result.finishBy).toBeInstanceOf(Date);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it("should throw error for invalid task UUID", () => {
    const invalidTask = { ...validTask, id: "not-a-uuid" };
    expect(() => validateGroupTask(invalidTask)).toThrow("Invalid group task");
  });

  it("should throw error for invalid user UUID", () => {
    const invalidTask = { ...validTask, userId: "not-a-uuid" };
    expect(() => validateGroupTask(invalidTask)).toThrow("Invalid group task");
  });
});

describe("validateGroupTaskArray", () => {
  const task1 = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Task 1",
    description: "Description 1",
    completed: false,
    userId: "223e4567-e89b-12d3-a456-426614174000",
    userName: "John Doe",
    finishBy: new Date("2024-12-31"),
    completedAt: null,
  };

  const task2 = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    title: "Task 2",
    description: null,
    completed: true,
    userId: "323e4567-e89b-12d3-a456-426614174000",
    userName: "Jane Smith",
    finishBy: null,
    completedAt: new Date("2024-01-15"),
  };

  it("should validate an array of valid group tasks", () => {
    const result = validateGroupTaskArray([task1, task2]);
    expect(result).toHaveLength(2);
    expect(result[0]!.title).toBe("Task 1");
    expect(result[1]!.title).toBe("Task 2");
  });

  it("should validate an empty array", () => {
    const result = validateGroupTaskArray([]);
    expect(result).toEqual([]);
  });

  it("should throw error if one task is invalid", () => {
    const invalidTasks = [task1, { ...task2, id: "not-a-uuid" }];
    expect(() => validateGroupTaskArray(invalidTasks)).toThrow(
      "Invalid group task array"
    );
  });
});
