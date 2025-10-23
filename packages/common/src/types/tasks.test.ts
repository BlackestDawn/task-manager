import { describe, it, expect } from "vitest";
import {
  validateTask,
  validateTaskArray,
  validateCreateTaskRequest,
  validateUpdateTaskRequest,
  validateUpdateTaskDoneStatusRequest,
  type Task,
  type CreateTaskRequest,
  type UpdateTaskRequest,
} from "./tasks";

describe("validateTask", () => {
  const validTask: Task = {
    __typename: "Task",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    title: "Test Task",
    description: "Test description",
    finishBy: new Date("2024-12-31"),
    userId: "223e4567-e89b-12d3-a456-426614174000",
    completed: false,
    completedAt: null,
    groups: [],
  };

  it("should validate a valid task object", () => {
    const result = validateTask(validTask);
    expect(result).toBeDefined();
    expect(result.id).toBe(validTask.id);
    expect(result.title).toBe(validTask.title);
    expect(result.userId).toBe(validTask.userId);
  });

  it("should add default __typename", () => {
    const taskWithoutTypename = { ...validTask };
    delete (taskWithoutTypename as any).__typename;
    const result = validateTask(taskWithoutTypename);
    expect(result.__typename).toBe("Task");
  });

  it("should handle task with groups", () => {
    const taskWithGroups = {
      ...validTask,
      groups: [
        { id: "323e4567-e89b-12d3-a456-426614174000" },
        { id: "423e4567-e89b-12d3-a456-426614174000" },
      ],
    };
    const result = validateTask(taskWithGroups);
    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]!.id).toBe("323e4567-e89b-12d3-a456-426614174000");
  });

  it("should handle null description", () => {
    const taskWithNullDesc = { ...validTask, description: null };
    const result = validateTask(taskWithNullDesc);
    expect(result.description).toBeNull();
  });

  it("should handle undefined description and default to null", () => {
    const { description, ...taskWithoutDesc } = validTask;
    const result = validateTask(taskWithoutDesc);
    expect(result.description).toBeNull();
  });

  it("should handle null finishBy date", () => {
    const taskWithNullFinishBy = { ...validTask, finishBy: null };
    const result = validateTask(taskWithNullFinishBy);
    expect(result.finishBy).toBeNull();
  });

  it("should handle undefined finishBy and default to null", () => {
    const { finishBy, ...taskWithoutFinishBy } = validTask;
    const result = validateTask(taskWithoutFinishBy);
    expect(result.finishBy).toBeNull();
  });

  it("should handle completed task with completedAt date", () => {
    const completedTask = {
      ...validTask,
      completed: true,
      completedAt: new Date("2024-01-15"),
    };
    const result = validateTask(completedTask);
    expect(result.completed).toBe(true);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it("should handle null completedAt", () => {
    const task = { ...validTask, completedAt: null };
    const result = validateTask(task);
    expect(result.completedAt).toBeNull();
  });

  it("should coerce string dates to Date objects", () => {
    const taskWithStringDates = {
      ...validTask,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
      finishBy: "2024-12-31T00:00:00Z",
      completedAt: "2024-01-15T00:00:00Z",
    };
    const result = validateTask(taskWithStringDates);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.finishBy).toBeInstanceOf(Date);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it("should apply default values", () => {
    const minimalTask = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      createdAt: new Date(),
      updatedAt: new Date(),
      title: "Minimal Task",
      userId: "223e4567-e89b-12d3-a456-426614174000",
      completed: false,
    };
    const result = validateTask(minimalTask);
    expect(result.description).toBeNull();
    expect(result.finishBy).toBeNull();
    expect(result.completedAt).toBeNull();
    expect(result.groups).toEqual([]);
  });

  it("should throw error for invalid task UUID", () => {
    const invalidTask = { ...validTask, id: "not-a-uuid" };
    expect(() => validateTask(invalidTask)).toThrow("Invalid task item");
  });

  it("should throw error for invalid user UUID", () => {
    const invalidTask = { ...validTask, userId: "not-a-uuid" };
    expect(() => validateTask(invalidTask)).toThrow("Invalid task item");
  });

  it("should throw error for invalid group UUID", () => {
    const invalidTask = {
      ...validTask,
      groups: [{ id: "not-a-uuid" }],
    };
    expect(() => validateTask(invalidTask)).toThrow("Invalid task item");
  });

  it("should throw error for missing required field", () => {
    const { title, ...taskWithoutTitle } = validTask;
    expect(() => validateTask(taskWithoutTitle)).toThrow("Invalid task item");
  });

  it("should throw error for wrong completed type", () => {
    const invalidTask = { ...validTask, completed: "yes" };
    expect(() => validateTask(invalidTask)).toThrow("Invalid task item");
  });

  it("should throw error for wrong data type", () => {
    expect(() => validateTask("not an object")).toThrow("Invalid task item");
    expect(() => validateTask(123)).toThrow("Invalid task item");
    expect(() => validateTask(null)).toThrow("Invalid task item");
  });
});

describe("validateTaskArray", () => {
  const task1: Task = {
    __typename: "Task",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Task 1",
    description: "First task",
    finishBy: null,
    userId: "223e4567-e89b-12d3-a456-426614174000",
    completed: false,
    completedAt: null,
    groups: [],
  };

  const task2: Task = {
    __typename: "Task",
    id: "223e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Task 2",
    description: null,
    finishBy: new Date("2024-12-31"),
    userId: "323e4567-e89b-12d3-a456-426614174000",
    completed: true,
    completedAt: new Date(),
    groups: [{ id: "423e4567-e89b-12d3-a456-426614174000" }],
  };

  it("should validate an array of valid tasks", () => {
    const result = validateTaskArray([task1, task2]);
    expect(result).toHaveLength(2);
    expect(result[0]!.title).toBe("Task 1");
    expect(result[1]!.title).toBe("Task 2");
  });

  it("should validate an empty array", () => {
    const result = validateTaskArray([]);
    expect(result).toEqual([]);
  });

  it("should throw error if one task is invalid", () => {
    const invalidTasks = [task1, { ...task2, id: "not-a-uuid" }];
    expect(() => validateTaskArray(invalidTasks)).toThrow("Invalid task item");
  });

  it("should throw error for non-array input", () => {
    expect(() => validateTaskArray(task1 as any)).toThrow("Invalid task item");
  });
});

describe("validateCreateTaskRequest", () => {
  const validRequest: CreateTaskRequest = {
    title: "New Task",
    description: "Task description",
    finishBy: new Date("2024-12-31"),
    userId: "123e4567-e89b-12d3-a456-426614174000",
  };

  it("should validate a valid create task request", () => {
    const result = validateCreateTaskRequest(validRequest);
    expect(result.title).toBe(validRequest.title);
    expect(result.description).toBe(validRequest.description);
    expect(result.finishBy).toBeInstanceOf(Date);
    expect(result.userId).toBe(validRequest.userId);
  });

  it("should handle null description", () => {
    const requestWithNullDesc = { ...validRequest, description: null };
    const result = validateCreateTaskRequest(requestWithNullDesc);
    expect(result.description).toBeNull();
  });

  it("should handle undefined description and default to null", () => {
    const { description, ...requestWithoutDesc } = validRequest;
    const result = validateCreateTaskRequest(requestWithoutDesc);
    expect(result.description).toBeNull();
  });

  it("should handle null finishBy", () => {
    const requestWithNullFinishBy = { ...validRequest, finishBy: null };
    const result = validateCreateTaskRequest(requestWithNullFinishBy);
    expect(result.finishBy).toBeNull();
  });

  it("should handle undefined finishBy and default to null", () => {
    const { finishBy, ...requestWithoutFinishBy } = validRequest;
    const result = validateCreateTaskRequest(requestWithoutFinishBy);
    expect(result.finishBy).toBeNull();
  });

  it("should coerce string date to Date object", () => {
    const requestWithStringDate = {
      ...validRequest,
      finishBy: "2024-12-31T00:00:00Z",
    };
    const result = validateCreateTaskRequest(requestWithStringDate);
    expect(result.finishBy).toBeInstanceOf(Date);
  });

  it("should throw error for missing title", () => {
    const { title, ...requestWithoutTitle } = validRequest;
    expect(() => validateCreateTaskRequest(requestWithoutTitle)).toThrow(
      "Invalid create task request"
    );
  });

  it("should throw error for missing userId", () => {
    const { userId, ...requestWithoutUserId } = validRequest;
    expect(() => validateCreateTaskRequest(requestWithoutUserId)).toThrow(
      "Invalid create task request"
    );
  });

  it("should throw error for invalid userId UUID", () => {
    const invalidRequest = { ...validRequest, userId: "not-a-uuid" };
    expect(() => validateCreateTaskRequest(invalidRequest)).toThrow(
      "Invalid create task request"
    );
  });

  it("should throw error for empty title", () => {
    const invalidRequest = { ...validRequest, title: "" };
    expect(() => validateCreateTaskRequest(invalidRequest)).toThrow(
      "Invalid create task request"
    );
  });

  it("should throw error for invalid date", () => {
    const invalidRequest = { ...validRequest, finishBy: "not-a-date" };
    expect(() => validateCreateTaskRequest(invalidRequest)).toThrow(
      "Invalid create task request"
    );
  });
});

describe("validateUpdateTaskRequest", () => {
  const validRequest: UpdateTaskRequest = {
    title: "Updated Task",
    description: "Updated description",
    finishBy: new Date("2024-12-31"),
  };

  it("should validate a valid update task request", () => {
    const result = validateUpdateTaskRequest(validRequest);
    expect(result.title).toBe(validRequest.title);
    expect(result.description).toBe(validRequest.description);
    expect(result.finishBy).toBeInstanceOf(Date);
  });

  it("should handle null description", () => {
    const requestWithNullDesc = { ...validRequest, description: null };
    const result = validateUpdateTaskRequest(requestWithNullDesc);
    expect(result.description).toBeNull();
  });

  it("should handle undefined description and default to null", () => {
    const { description, ...requestWithoutDesc } = validRequest;
    const result = validateUpdateTaskRequest(requestWithoutDesc);
    expect(result.description).toBeNull();
  });

  it("should handle null finishBy", () => {
    const requestWithNullFinishBy = { ...validRequest, finishBy: null };
    const result = validateUpdateTaskRequest(requestWithNullFinishBy);
    expect(result.finishBy).toBeNull();
  });

  it("should handle undefined finishBy and default to null", () => {
    const { finishBy, ...requestWithoutFinishBy } = validRequest;
    const result = validateUpdateTaskRequest(requestWithoutFinishBy);
    expect(result.finishBy).toBeNull();
  });

  it("should coerce string date to Date object", () => {
    const requestWithStringDate = {
      ...validRequest,
      finishBy: "2024-12-31T00:00:00Z",
    };
    const result = validateUpdateTaskRequest(requestWithStringDate);
    expect(result.finishBy).toBeInstanceOf(Date);
  });

  it("should throw error for missing title", () => {
    const { title, ...requestWithoutTitle } = validRequest;
    expect(() => validateUpdateTaskRequest(requestWithoutTitle)).toThrow(
      "Invalid update task request"
    );
  });

  it("should throw error for empty title", () => {
    const invalidRequest = { ...validRequest, title: "" };
    expect(() => validateUpdateTaskRequest(invalidRequest)).toThrow(
      "Invalid update task request"
    );
  });

  it("should accept very long descriptions", () => {
    const longDescription = "a".repeat(10000);
    const request = { ...validRequest, description: longDescription };
    const result = validateUpdateTaskRequest(request);
    expect(result.description).toBe(longDescription);
  });
});

describe("validateUpdateTaskDoneStatusRequest", () => {
  it("should validate request to mark task as completed", () => {
    const request = { completed: true };
    const result = validateUpdateTaskDoneStatusRequest(request);
    expect(result.completed).toBe(true);
  });

  it("should validate request to mark task as not completed", () => {
    const request = { completed: false };
    const result = validateUpdateTaskDoneStatusRequest(request);
    expect(result.completed).toBe(false);
  });

  it("should throw error for missing completed field", () => {
    expect(() => validateUpdateTaskDoneStatusRequest({})).toThrow(
      "Invalid update task done status request"
    );
  });

  it("should throw error for non-boolean completed field", () => {
    expect(() =>
      validateUpdateTaskDoneStatusRequest({ completed: "true" })
    ).toThrow("Invalid update task done status request");
    expect(() =>
      validateUpdateTaskDoneStatusRequest({ completed: 1 })
    ).toThrow("Invalid update task done status request");
    expect(() =>
      validateUpdateTaskDoneStatusRequest({ completed: null })
    ).toThrow("Invalid update task done status request");
  });

  it("should throw error for additional unexpected fields", () => {
    const requestWithExtra = { completed: true, extra: "field" };
    // Zod will strip extra fields, so this should still pass
    const result = validateUpdateTaskDoneStatusRequest(requestWithExtra);
    expect(result.completed).toBe(true);
    expect((result as any).extra).toBeUndefined();
  });
});
