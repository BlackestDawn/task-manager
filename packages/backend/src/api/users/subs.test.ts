import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handlerGetTasksForUser,
  handlerGetGroupsForUser,
  handlerUpdateUserPassword,
  handlerUpdateUserDisabled,
} from "./subs";
import { getUserById, getGroupsForUser, updatePassword, updateUserDisabledStatus } from "../../db/queries/users";
import { getAllTasksForUser } from "../../db/queries/tasks";
import { hashPassword } from "../../lib/auth/authentication";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/users", () => ({
  getUserById: vi.fn(),
  getGroupsForUser: vi.fn(),
  updatePassword: vi.fn(),
  updateUserDisabledStatus: vi.fn(),
}));

vi.mock("../../db/queries/tasks", () => ({
  getAllTasksForUser: vi.fn(),
}));

vi.mock("../../lib/auth/authentication", () => ({
  hashPassword: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";

function makeUserRow(overrides: Record<string, unknown> = {}) {
  return {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "testuser",
    name: "Test User",
    email: null,
    disabled: false,
    accessLevel: "user" as const,
    groups: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(getUserById).mockReset();
  vi.mocked(getGroupsForUser).mockReset();
  vi.mocked(updatePassword).mockReset();
  vi.mocked(updateUserDisabledStatus).mockReset();
  vi.mocked(getAllTasksForUser).mockReset();
  vi.mocked(hashPassword).mockReset();
});

describe("handlerGetTasksForUser", () => {
  it("returns visible tasks for the given user", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);
    vi.mocked(getAllTasksForUser).mockResolvedValue([
      {
        __typename: "Task",
        id: "323e4567-e89b-12d3-a456-426614174000",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "A task",
        description: null,
        finishBy: null,
        userId: USER_ID,
        completed: false,
        completedAt: null,
        groups: [],
      },
    ] as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetTasksForUser(c) as any;

    expect(result.data).toHaveLength(1);
  });

  it("throws NotFoundError when the user does not exist", async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetTasksForUser(c)).rejects.toThrow("User not found");
  });
});

describe("handlerGetGroupsForUser", () => {
  it("returns visible groups for the given user", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);
    vi.mocked(getGroupsForUser).mockResolvedValue([
      {
        __typename: "Group",
        id: "423e4567-e89b-12d3-a456-426614174000",
        name: "G",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetGroupsForUser(c) as any;

    expect(result.data).toHaveLength(1);
  });

  it("throws NotFoundError when the user does not exist", async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetGroupsForUser(c)).rejects.toThrow("User not found");
  });
});

describe("handlerUpdateUserPassword", () => {
  it("allows a user to change their own password", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);
    vi.mocked(hashPassword).mockResolvedValue("new-hashed-password");
    vi.mocked(updatePassword).mockResolvedValue(makeUserRow() as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { password: "newSecurePassword123" },
    });
    await handlerUpdateUserPassword(c);

    expect(updatePassword).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: USER_ID, data: { password: "new-hashed-password" } })
    );
  });

  it("rejects a password shorter than 8 characters", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { password: "short" },
    });

    await expect(handlerUpdateUserPassword(c)).rejects.toThrow(
      "Password must be at least 8 characters long"
    );
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it("rejects a missing password", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: {},
    });

    await expect(handlerUpdateUserPassword(c)).rejects.toThrow(
      "Password must be at least 8 characters long"
    );
  });

  it("throws NotFoundError when the user does not exist", async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { password: "newSecurePassword123" },
    });

    await expect(handlerUpdateUserPassword(c)).rejects.toThrow("User not found");
  });

  it("rejects a plain user changing someone else's password", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "user" }) },
      jsonBody: { password: "newSecurePassword123" },
    });

    await expect(handlerUpdateUserPassword(c)).rejects.toThrow("User not authorized");
  });

  it("allows a manager to change another user's password", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);
    vi.mocked(hashPassword).mockResolvedValue("new-hashed-password");
    vi.mocked(updatePassword).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { password: "newSecurePassword123" },
    });
    await handlerUpdateUserPassword(c);

    expect(updatePassword).toHaveBeenCalled();
  });
});

describe("handlerUpdateUserDisabled", () => {
  it("allows a manager to disable another user", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);
    vi.mocked(updateUserDisabledStatus).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID, disabled: true }) as any);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { disabled: true },
    });
    const result = await handlerUpdateUserDisabled(c) as any;

    expect(result.data.disabled).toBe(true);
  });

  it("throws NotFoundError when the user does not exist", async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { disabled: true },
    });

    await expect(handlerUpdateUserDisabled(c)).rejects.toThrow("User not found");
  });

  it("rejects a plain user disabling someone else", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "user" }) },
      jsonBody: { disabled: true },
    });

    await expect(handlerUpdateUserDisabled(c)).rejects.toThrow("User not authorized");
    expect(updateUserDisabledStatus).not.toHaveBeenCalled();
  });
});
