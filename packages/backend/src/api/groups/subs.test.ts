import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handlerGetGroupMembers,
  handlerGetGroupTasks,
  handlerAddUserToGroup,
  handlerRemoveUserFromGroup,
  handlerAssignTaskToGroup,
  handlerRemoveTaskFromGroup,
} from "./subs";
import {
  getGroupById,
  getGroupMembers,
  getGroupTasks,
  assignTaskToGroup,
  removeTaskFromGroup,
  addUserToGroup,
  removeUserFromGroup,
} from "../../db/queries/groups";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/groups", () => ({
  getGroupById: vi.fn(),
  getGroupMembers: vi.fn(),
  getGroupTasks: vi.fn(),
  assignTaskToGroup: vi.fn(),
  removeTaskFromGroup: vi.fn(),
  addUserToGroup: vi.fn(),
  removeUserFromGroup: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";
const GROUP_ID = "423e4567-e89b-12d3-a456-426614174000";
const TASK_ID = "523e4567-e89b-12d3-a456-426614174000";

function makeGroupRow(overrides: Record<string, unknown> = {}) {
  return {
    __typename: "Group",
    id: GROUP_ID,
    name: "Engineering",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(getGroupById).mockReset();
  vi.mocked(getGroupMembers).mockReset();
  vi.mocked(getGroupTasks).mockReset();
  vi.mocked(assignTaskToGroup).mockReset();
  vi.mocked(removeTaskFromGroup).mockReset();
  vi.mocked(addUserToGroup).mockReset();
  vi.mocked(removeUserFromGroup).mockReset();
});

describe("handlerGetGroupMembers", () => {
  it("returns visible members", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);
    vi.mocked(getGroupMembers).mockResolvedValue([
      {
        __typename: "User", id: OTHER_USER_ID, createdAt: new Date(), updatedAt: new Date(),
        login: "other", name: "Other", email: null, disabled: false, accessLevel: "user", groups: [],
      },
    ] as any);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetGroupMembers(c) as any;

    expect(result.data).toHaveLength(1);
  });

  it("throws NotFoundError when the group does not exist", async () => {
    vi.mocked(getGroupById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetGroupMembers(c)).rejects.toThrow("Group not found");
  });
});

describe("handlerGetGroupTasks", () => {
  it("returns visible tasks", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);
    vi.mocked(getGroupTasks).mockResolvedValue([
      {
        __typename: "Task", id: TASK_ID, createdAt: new Date(), updatedAt: new Date(),
        title: "T", description: null, finishBy: null, userId: USER_ID, completed: false,
        completedAt: null, groups: [{ id: GROUP_ID }],
      },
    ] as any);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetGroupTasks(c) as any;

    expect(result.data).toHaveLength(1);
  });

  it("throws NotFoundError when the group does not exist", async () => {
    vi.mocked(getGroupById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetGroupTasks(c)).rejects.toThrow("Group not found");
  });
});

describe("handlerAddUserToGroup", () => {
  it("allows a supervisor of the group to add a user", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "supervisor" }] }),
      },
      jsonBody: { userId: OTHER_USER_ID, role: "user" },
    });
    const result = await handlerAddUserToGroup(c) as any;

    expect(result.status).toBe(204);
    expect(addUserToGroup).toHaveBeenCalledWith(
      expect.anything(),
      { id: GROUP_ID, data: { userId: OTHER_USER_ID, role: "user" } }
    );
  });

  it("rejects an editor of the group (no assignUser rights)", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "editor" }] }),
      },
      jsonBody: { userId: OTHER_USER_ID, role: "user" },
    });

    await expect(handlerAddUserToGroup(c)).rejects.toThrow("User not authorized");
    expect(addUserToGroup).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the group does not exist", async () => {
    vi.mocked(getGroupById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "admin" }) },
      jsonBody: { userId: OTHER_USER_ID, role: "user" },
    });

    await expect(handlerAddUserToGroup(c)).rejects.toThrow("Group not found");
  });
});

describe("handlerRemoveUserFromGroup", () => {
  it("allows a supervisor of the group to remove a user", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "supervisor" }] }),
      },
      jsonBody: { userId: OTHER_USER_ID },
    });
    const result = await handlerRemoveUserFromGroup(c) as any;

    expect(result.status).toBe(204);
  });

  it("rejects a viewer of the group", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "viewer" }] }),
      },
      jsonBody: { userId: OTHER_USER_ID },
    });

    await expect(handlerRemoveUserFromGroup(c)).rejects.toThrow("User not authorized");
    expect(removeUserFromGroup).not.toHaveBeenCalled();
  });
});

describe("handlerAssignTaskToGroup", () => {
  it("allows an editor of the group to assign a task", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        user: { id: USER_ID },
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "editor" }] }),
      },
      jsonBody: { taskId: TASK_ID, assignedBy: USER_ID },
    });
    const result = await handlerAssignTaskToGroup(c) as any;

    expect(result.status).toBe(204);
    expect(assignTaskToGroup).toHaveBeenCalled();
  });

  it("rejects a viewer of the group", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        user: { id: USER_ID },
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "viewer" }] }),
      },
      jsonBody: { taskId: TASK_ID, assignedBy: USER_ID },
    });

    await expect(handlerAssignTaskToGroup(c)).rejects.toThrow("User not authorized");
    expect(assignTaskToGroup).not.toHaveBeenCalled();
  });
});

describe("handlerRemoveTaskFromGroup", () => {
  it("allows a supervisor of the group to remove a task", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "supervisor" }] }),
      },
      jsonBody: { taskId: TASK_ID },
    });
    const result = await handlerRemoveTaskFromGroup(c) as any;

    expect(result.status).toBe(204);
  });

  it("rejects an editor of the group (no removeTask rights)", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "editor" }] }),
      },
      jsonBody: { taskId: TASK_ID },
    });

    await expect(handlerRemoveTaskFromGroup(c)).rejects.toThrow("User not authorized");
    expect(removeTaskFromGroup).not.toHaveBeenCalled();
  });
});
