import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlerUpdateGroup, handlerDeleteGroup, handlerGetGroupById } from "./direct";
import { updateGroup, removeGroup, getGroupById } from "../../db/queries/groups";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/groups", () => ({
  updateGroup: vi.fn(),
  removeGroup: vi.fn(),
  getGroupById: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const GROUP_ID = "423e4567-e89b-12d3-a456-426614174000";

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
  vi.mocked(updateGroup).mockReset();
  vi.mocked(removeGroup).mockReset();
  vi.mocked(getGroupById).mockReset();
});

describe("handlerUpdateGroup", () => {
  it("allows a supervisor of the group to update it", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);
    vi.mocked(updateGroup).mockResolvedValue(makeGroupRow({ name: "Renamed" }) as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "supervisor" }] }),
      },
      jsonBody: { name: "Renamed", description: null },
    });
    const result = await handlerUpdateGroup(c) as any;

    expect(result.data.name).toBe("Renamed");
  });

  it("rejects an editor of the group (no update rights on the group itself)", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "editor" }] }),
      },
      jsonBody: { name: "Renamed", description: null },
    });

    await expect(handlerUpdateGroup(c)).rejects.toThrow("User not authorized");
    expect(updateGroup).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the group does not exist", async () => {
    vi.mocked(getGroupById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { name: "Renamed", description: null },
    });

    await expect(handlerUpdateGroup(c)).rejects.toThrow("Group not found");
    expect(updateGroup).not.toHaveBeenCalled();
  });

  it("throws NotFoundError if the group vanishes between the fetch and the update", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);
    vi.mocked(updateGroup).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { name: "Renamed", description: null },
    });

    await expect(handlerUpdateGroup(c)).rejects.toThrow("Group not found");
  });
});

describe("handlerDeleteGroup", () => {
  it("allows a manager to delete a group", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
    });
    const result = await handlerDeleteGroup(c) as any;

    expect(result.status).toBe(204);
    expect(removeGroup).toHaveBeenCalledWith(expect.anything(), { id: GROUP_ID });
  });

  it("rejects a supervisor (no delete rights on their own group)", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: {
        recID: { id: GROUP_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "supervisor" }] }),
      },
    });

    await expect(handlerDeleteGroup(c)).rejects.toThrow("User not authorized");
    expect(removeGroup).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the group does not exist", async () => {
    vi.mocked(getGroupById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
    });

    await expect(handlerDeleteGroup(c)).rejects.toThrow("Group not found");
  });
});

describe("handlerGetGroupById", () => {
  it("returns the group", async () => {
    vi.mocked(getGroupById).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetGroupById(c) as any;

    expect(result.data.id).toBe(GROUP_ID);
  });

  it("throws NotFoundError when the group does not exist", async () => {
    vi.mocked(getGroupById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: GROUP_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetGroupById(c)).rejects.toThrow("Group not found");
  });
});
