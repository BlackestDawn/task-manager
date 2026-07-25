import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlerCreateGroup, handlerGetGroups } from "./general";
import { createGroup, getGroups } from "../../db/queries/groups";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/groups", () => ({
  createGroup: vi.fn(),
  getGroups: vi.fn(),
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
  vi.mocked(createGroup).mockReset();
  vi.mocked(getGroups).mockReset();
});

describe("handlerCreateGroup", () => {
  it("allows a manager to create a group", async () => {
    vi.mocked(createGroup).mockResolvedValue(makeGroupRow({ name: "New Group" }) as any);

    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID, accessLevel: "manager" }) },
      jsonBody: { name: "New Group", description: null },
    });
    const result = await handlerCreateGroup(c) as any;

    expect(result.status).toBe(201);
    expect(result.data.name).toBe("New Group");
  });

  it("rejects a plain user creating a group", async () => {
    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID, accessLevel: "user" }) },
      jsonBody: { name: "New Group", description: null },
    });

    await expect(handlerCreateGroup(c)).rejects.toThrow("User not authorized");
    expect(createGroup).not.toHaveBeenCalled();
  });

  it("allows an admin to create a group", async () => {
    vi.mocked(createGroup).mockResolvedValue(makeGroupRow() as any);

    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID, accessLevel: "admin" }) },
      jsonBody: { name: "New Group", description: null },
    });
    const result = await handlerCreateGroup(c) as any;

    expect(result.status).toBe(201);
  });
});

describe("handlerGetGroups", () => {
  it("returns all groups, since reading groups is unconditionally allowed", async () => {
    vi.mocked(getGroups).mockResolvedValue([makeGroupRow(), makeGroupRow({ id: "523e4567-e89b-12d3-a456-426614174000" })] as any);

    const c = makeContext({
      get: { capabilities: makeAbilities({ id: USER_ID, accessLevel: "user" }) },
    });
    const result = await handlerGetGroups(c) as any;

    expect(result.data).toHaveLength(2);
  });
});
