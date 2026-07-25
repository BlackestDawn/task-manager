import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Group } from "@task-manager/common";
import {
  getGroupsAction,
  getGroupAction,
  getAllGroupsAction,
  getGroupTasksAction,
  getGroupMembersAction,
  createGroupAction,
  updateGroupAction,
  deleteGroupAction,
  addUserToGroupAction,
  removeUserFromGroupAction,
  assignTaskToGroupAction,
  removeTaskFromGroupAction,
} from "./groups";
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

const GROUP_ID = "423e4567-e89b-12d3-a456-426614174000";
const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const TASK_ID = "523e4567-e89b-12d3-a456-426614174000";

function makeGroup(overrides: Partial<Group> = {}): Group {
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
  vi.mocked(serverGet).mockReset();
  vi.mocked(serverPost).mockReset();
  vi.mocked(serverPut).mockReset();
  vi.mocked(serverDelete).mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe("read actions fail soft (empty array / null) instead of throwing", () => {
  it("getGroupsAction returns [] on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getGroupsAction()).toEqual([]);
  });

  it("getGroupAction returns null on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getGroupAction(GROUP_ID)).toBeNull();
  });

  it("getAllGroupsAction returns [] on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getAllGroupsAction()).toEqual([]);
  });

  it("getGroupTasksAction returns [] on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getGroupTasksAction(GROUP_ID)).toEqual([]);
  });

  it("getGroupMembersAction returns [] on failure", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("x"));
    expect(await getGroupMembersAction(GROUP_ID)).toEqual([]);
  });

  it("getGroupAction returns the group on success", async () => {
    vi.mocked(serverGet).mockResolvedValue(makeGroup());
    expect((await getGroupAction(GROUP_ID))?.id).toBe(GROUP_ID);
  });
});

describe("createGroupAction", () => {
  it("creates the group and revalidates on success", async () => {
    vi.mocked(serverPost).mockResolvedValue(makeGroup({ name: "New" }));

    const result = await createGroupAction({ name: "New", description: null });

    expect(result).toEqual({ success: true, group: expect.objectContaining({ name: "New" }) });
    expect(revalidatePath).toHaveBeenCalledWith("/groups");
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPost).mockRejectedValue(new Error("Group creation failed"));

    const result = await createGroupAction({ name: "New", description: null });

    expect(result).toEqual({ success: false, error: "Group creation failed" });
  });

  it("returns a failure result for invalid input without calling the API", async () => {
    const result = await createGroupAction({ name: "", description: null });

    expect(result.success).toBe(false);
    expect(serverPost).not.toHaveBeenCalled();
  });
});

describe("updateGroupAction", () => {
  it("updates the group and revalidates both list and detail paths", async () => {
    vi.mocked(serverPut).mockResolvedValue(makeGroup({ name: "Renamed" }));

    const result = await updateGroupAction(GROUP_ID, { name: "Renamed", description: null });

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/groups");
    expect(revalidatePath).toHaveBeenCalledWith(`/groups/${GROUP_ID}`);
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPut).mockRejectedValue(new Error("Group update failed"));

    const result = await updateGroupAction(GROUP_ID, { name: "Renamed", description: null });

    expect(result).toEqual({ success: false, error: "Group update failed" });
  });
});

describe("deleteGroupAction", () => {
  it("deletes the group and revalidates on success", async () => {
    vi.mocked(serverDelete).mockResolvedValue(undefined);

    const result = await deleteGroupAction(GROUP_ID);

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/groups");
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverDelete).mockRejectedValue(new Error("Group deletion failed"));

    const result = await deleteGroupAction(GROUP_ID);

    expect(result).toEqual({ success: false, error: "Group deletion failed" });
  });
});

describe("addUserToGroupAction", () => {
  it("adds the user and revalidates groups + users paths on success", async () => {
    vi.mocked(serverPost).mockResolvedValue(undefined);

    const result = await addUserToGroupAction(GROUP_ID, { userId: USER_ID, role: "user" });

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/groups");
    expect(revalidatePath).toHaveBeenCalledWith(`/groups/${GROUP_ID}`);
    expect(revalidatePath).toHaveBeenCalledWith("/users");
    expect(revalidatePath).toHaveBeenCalledWith(`/users/${USER_ID}`);
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPost).mockRejectedValue(new Error("Adding user to group failed"));

    const result = await addUserToGroupAction(GROUP_ID, { userId: USER_ID, role: "user" });

    expect(result).toEqual({ success: false, error: "Adding user to group failed" });
  });
});

describe("removeUserFromGroupAction", () => {
  it("removes the user and revalidates on success", async () => {
    vi.mocked(serverDelete).mockResolvedValue(undefined);

    const result = await removeUserFromGroupAction(GROUP_ID, { userId: USER_ID });

    expect(result).toEqual({ success: true });
    expect(serverDelete).toHaveBeenCalledWith(
      `/groups/${GROUP_ID}/users`,
      expect.objectContaining({ body: JSON.stringify({ userId: USER_ID }) })
    );
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverDelete).mockRejectedValue(new Error("Removing user from group failed"));

    const result = await removeUserFromGroupAction(GROUP_ID, { userId: USER_ID });

    expect(result).toEqual({ success: false, error: "Removing user from group failed" });
  });
});

describe("assignTaskToGroupAction", () => {
  it("assigns the task and revalidates groups + tasks paths on success", async () => {
    vi.mocked(serverPost).mockResolvedValue(undefined);

    const result = await assignTaskToGroupAction(GROUP_ID, { taskId: TASK_ID, assignedBy: USER_ID });

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith(`/tasks/${TASK_ID}`);
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPost).mockRejectedValue(new Error("Assigning task to group failed"));

    const result = await assignTaskToGroupAction(GROUP_ID, { taskId: TASK_ID, assignedBy: USER_ID });

    expect(result).toEqual({ success: false, error: "Assigning task to group failed" });
  });
});

describe("removeTaskFromGroupAction", () => {
  it("removes the task and revalidates on success", async () => {
    vi.mocked(serverDelete).mockResolvedValue(undefined);

    const result = await removeTaskFromGroupAction(GROUP_ID, { taskId: TASK_ID });

    expect(result).toEqual({ success: true });
    expect(serverDelete).toHaveBeenCalledWith(
      `/groups/${GROUP_ID}/tasks`,
      expect.objectContaining({ body: JSON.stringify({ taskId: TASK_ID }) })
    );
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverDelete).mockRejectedValue(new Error("Removing task from group failed"));

    const result = await removeTaskFromGroupAction(GROUP_ID, { taskId: TASK_ID });

    expect(result).toEqual({ success: false, error: "Removing task from group failed" });
  });
});
