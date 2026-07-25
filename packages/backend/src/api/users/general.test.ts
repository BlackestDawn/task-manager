import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlerGetUsers, handlerCreateUser } from "./general";
import { createUser, getUsers } from "../../db/queries/users";
import { hashPassword } from "../../lib/auth/authentication";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/users", () => ({
  createUser: vi.fn(),
  getUsers: vi.fn(),
}));

vi.mock("../../lib/auth/authentication", () => ({
  hashPassword: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

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
  vi.mocked(createUser).mockReset();
  vi.mocked(getUsers).mockReset();
  vi.mocked(hashPassword).mockReset();
});

describe("handlerGetUsers", () => {
  it("returns all users visible to the requester", async () => {
    vi.mocked(getUsers).mockResolvedValue([makeUserRow(), makeUserRow({ id: "223e4567-e89b-12d3-a456-426614174000" })] as any);

    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetUsers(c) as any;

    expect(result.data).toHaveLength(2);
  });
});

describe("handlerCreateUser", () => {
  it("allows a manager to create a user", async () => {
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    vi.mocked(createUser).mockResolvedValue(makeUserRow({ login: "newuser" }) as any);

    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { login: "newuser", password: "plaintext-password", name: "New User", email: null },
    });
    const result = await handlerCreateUser(c) as any;

    expect(result.status).toBe(201);
    expect(result.data.login).toBe("newuser");
    expect(createUser).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ password: "hashed-password" })
    );
  });

  it("rejects a plain user from creating a user", async () => {
    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID, accessLevel: "user" }) },
      jsonBody: { login: "newuser", password: "plaintext-password", name: "New User", email: null },
    });

    await expect(handlerCreateUser(c)).rejects.toThrow("User not authorized");
    expect(createUser).not.toHaveBeenCalled();
  });

  it("allows an admin to create a user", async () => {
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    vi.mocked(createUser).mockResolvedValue(makeUserRow() as any);

    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID, accessLevel: "admin" }) },
      jsonBody: { login: "newuser", password: "plaintext-password", name: "New User", email: null },
    });
    const result = await handlerCreateUser(c) as any;

    expect(result.status).toBe(201);
  });
});
