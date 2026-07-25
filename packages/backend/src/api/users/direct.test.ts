import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlerUpdateUser, handlerDeleteUser, handlerGetUserById } from "./direct";
import { updateUser, deleteUser, getUserById } from "../../db/queries/users";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/users", () => ({
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserById: vi.fn(),
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
    email: "test@example.com",
    disabled: false,
    accessLevel: "user" as const,
    groups: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(updateUser).mockReset();
  vi.mocked(deleteUser).mockReset();
  vi.mocked(getUserById).mockReset();
});

describe("handlerUpdateUser", () => {
  it("updates the user's own profile", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);
    vi.mocked(updateUser).mockResolvedValue(makeUserRow({ name: "New Name" }) as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { name: "New Name" },
    });
    const result = await handlerUpdateUser(c) as any;

    expect(result.data.name).toBe("New Name");
  });

  it("falls back to the existing values for fields omitted from the request body", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ name: "Original Name", email: "orig@example.com" }) as any);
    vi.mocked(updateUser).mockResolvedValue(makeUserRow() as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { name: "Updated Name" },
    });
    await handlerUpdateUser(c);

    expect(updateUser).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: USER_ID,
        data: expect.objectContaining({ name: "Updated Name", email: "orig@example.com" }),
      })
    );
  });

  it("throws NotFoundError when the user does not exist", async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { name: "New Name" },
    });

    await expect(handlerUpdateUser(c)).rejects.toThrow("User not found");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects a plain user editing someone else's profile", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { name: "New Name" },
    });

    await expect(handlerUpdateUser(c)).rejects.toThrow("User not authorized");
  });

  it("allows a manager to edit another user's profile", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);
    vi.mocked(updateUser).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID, name: "Renamed" }) as any);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { name: "Renamed" },
    });
    const result = await handlerUpdateUser(c) as any;

    expect(result.data.name).toBe("Renamed");
  });
});

describe("handlerDeleteUser", () => {
  it("deletes an existing user", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
    });
    const result = await handlerDeleteUser(c) as any;

    expect(result.status).toBe(204);
    expect(deleteUser).toHaveBeenCalledWith(expect.anything(), { id: USER_ID });
  });

  it("is idempotent — returns 204 without calling deleteUser when the user is already gone", async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
    });
    const result = await handlerDeleteUser(c) as any;

    expect(result.status).toBe(204);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("rejects a plain user deleting someone else", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ id: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: OTHER_USER_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "user" }) },
    });

    await expect(handlerDeleteUser(c)).rejects.toThrow("User not authorized");
    expect(deleteUser).not.toHaveBeenCalled();
  });
});

describe("handlerGetUserById", () => {
  it("returns a viewable user", async () => {
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetUserById(c) as any;

    expect(result.data.id).toBe(USER_ID);
  });

  it("throws NotFoundError when the user does not exist", async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: USER_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetUserById(c)).rejects.toThrow("User not found");
  });
});
