import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@task-manager/common";
import {
  getUsersAction,
  getUserAction,
  getUserTasksAction,
  getUserGroupsAction,
  createUserAction,
  updateUserAction,
  updateUserPasswordAction,
  updateUserDisabledAction,
  deleteUserAction,
} from "./users";
import { serverGet, serverPost, serverPut, serverDelete } from "@/lib/utils/serverFetch";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/utils/serverFetch", () => ({
  serverGet: vi.fn(),
  serverPost: vi.fn(),
  serverPut: vi.fn(),
  serverDelete: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "testuser",
    name: "Test User",
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(serverGet).mockReset();
  vi.mocked(serverPost).mockReset();
  vi.mocked(serverPut).mockReset();
  vi.mocked(serverDelete).mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe("read actions fail soft (empty array / null) instead of throwing", () => {
  it("getUsersAction returns [] on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getUsersAction()).toEqual([]);
  });

  it("getUserAction returns null on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getUserAction(USER_ID)).toBeNull();
  });

  it("getUserAction returns the user on success", async () => {
    vi.mocked(serverGet).mockResolvedValue(makeUser());
    expect((await getUserAction(USER_ID))?.id).toBe(USER_ID);
  });

  it("getUserTasksAction returns [] on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getUserTasksAction(USER_ID)).toEqual([]);
  });

  it("getUserGroupsAction returns [] on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getUserGroupsAction(USER_ID)).toEqual([]);
  });
});

describe("createUserAction", () => {
  it("creates the user and revalidates on success", async () => {
    vi.mocked(serverPost).mockResolvedValue(makeUser({ login: "newuser" }));

    const result = await createUserAction({
      login: "newuser",
      password: "securePassword123",
      name: "New User",
      email: null,
      accessLevel: "user",
    });

    expect(result).toEqual({ success: true, user: expect.objectContaining({ login: "newuser" }) });
    expect(revalidatePath).toHaveBeenCalledWith("/users");
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPost).mockRejectedValue(new Error("User creation failed"));

    const result = await createUserAction({
      login: "newuser",
      password: "securePassword123",
      name: "New User",
      email: null,
      accessLevel: "user",
    });

    expect(result).toEqual({ success: false, error: "User creation failed" });
  });

  it("returns a failure result for invalid input without calling the API", async () => {
    const result = await createUserAction({
      login: "newuser",
      password: "short",
      name: "New User",
      email: null,
      accessLevel: "user",
    });

    expect(result.success).toBe(false);
    expect(serverPost).not.toHaveBeenCalled();
  });
});

describe("updateUserAction", () => {
  it("updates the user and revalidates list + detail paths", async () => {
    vi.mocked(serverPut).mockResolvedValue(makeUser({ name: "Renamed" }));

    const result = await updateUserAction(USER_ID, {
      login: "testuser",
      name: "Renamed",
      email: null,
      accessLevel: "user",
    });

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/users");
    expect(revalidatePath).toHaveBeenCalledWith(`/users/${USER_ID}`);
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPut).mockRejectedValue(new Error("User update failed"));

    const result = await updateUserAction(USER_ID, {
      login: "testuser",
      name: "Renamed",
      email: null,
      accessLevel: "user",
    });

    expect(result).toEqual({ success: false, error: "User update failed" });
  });
});

describe("updateUserPasswordAction", () => {
  it("updates the password without revalidating any path", async () => {
    vi.mocked(serverPut).mockResolvedValue(undefined);

    const result = await updateUserPasswordAction(USER_ID, { password: "newSecurePassword123" });

    expect(result).toEqual({ success: true });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPut).mockRejectedValue(new Error("Password update failed"));

    const result = await updateUserPasswordAction(USER_ID, { password: "newSecurePassword123" });

    expect(result).toEqual({ success: false, error: "Password update failed" });
  });
});

describe("updateUserDisabledAction", () => {
  it("updates disabled status and revalidates list + detail paths", async () => {
    vi.mocked(serverPut).mockResolvedValue(makeUser({ disabled: true }));

    const result = await updateUserDisabledAction(USER_ID, { disabled: true });

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/users");
    expect(revalidatePath).toHaveBeenCalledWith(`/users/${USER_ID}`);
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPut).mockRejectedValue(new Error("Failed to update user status"));

    const result = await updateUserDisabledAction(USER_ID, { disabled: true });

    expect(result).toEqual({ success: false, error: "Failed to update user status" });
  });
});

describe("deleteUserAction", () => {
  it("deletes the user and revalidates on success", async () => {
    vi.mocked(serverDelete).mockResolvedValue(undefined);

    const result = await deleteUserAction(USER_ID);

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/users");
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverDelete).mockRejectedValue(new Error("User deletion failed"));

    const result = await deleteUserAction(USER_ID);

    expect(result).toEqual({ success: false, error: "User deletion failed" });
  });
});
