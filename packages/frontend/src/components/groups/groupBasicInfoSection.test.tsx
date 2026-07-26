import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type Group, type User } from "@task-manager/common";
import GroupBasicInfoSection from "./groupBasicInfoSection";
import { updateGroupAction, deleteGroupAction } from "@/lib/actions/groups";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { useRouter } from "next/navigation";

// GroupBasicInfoSection builds its own ability from `user` via defineAbilityFor;
// it never reads `ability` off the context.
const UNUSED_ABILITY = defineAbilityFor(null);

vi.mock("@/lib/actions/groups", () => ({
  updateGroupAction: vi.fn(),
  deleteGroupAction: vi.fn(),
}));

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const GROUP: Group = {
  __typename: "Group",
  id: "group-1",
  name: "Engineering",
  description: "The engineering team",
  createdAt: new Date(2026, 0, 1),
  updatedAt: new Date(),
};

function mockCurrentUser(overrides: Partial<User> = {}) {
  const user: User = {
    __typename: "User",
    id: "current-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "current",
    name: "Current User",
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
  vi.mocked(useAuthContext).mockReturnValue({
    user,
    isAuthenticated: true,
    ability: UNUSED_ABILITY,
    refreshAuth: async () => {},
  });
}

let routerPush: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.mocked(updateGroupAction).mockReset();
  vi.mocked(deleteGroupAction).mockReset();

  routerPush = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push: routerPush,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  });
});

describe("GroupBasicInfoSection — permission gating", () => {
  it("hides Edit Info and Delete Group for a plain user with no role in the group", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(<GroupBasicInfoSection group={GROUP} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /edit info/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete group/i })).not.toBeInTheDocument();
  });

  it("shows Edit Info but not Delete Group for a group supervisor", () => {
    mockCurrentUser({ accessLevel: "user", groups: [{ id: "group-1", role: "supervisor" }] });
    render(<GroupBasicInfoSection group={GROUP} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole("button", { name: /edit info/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete group/i })).not.toBeInTheDocument();
  });

  it("shows both Edit Info and Delete Group for an admin", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<GroupBasicInfoSection group={GROUP} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole("button", { name: /edit info/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete group/i })).toBeInTheDocument();
  });

  it("does not render the edit form for isEditing=true if the user lacks update permission", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(<GroupBasicInfoSection group={GROUP} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.queryByLabelText("Group Name")).not.toBeInTheDocument();
  });
});

describe("GroupBasicInfoSection — view mode", () => {
  it("displays the group's name and description", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<GroupBasicInfoSection group={GROUP} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("The engineering team")).toBeInTheDocument();
  });

  it("calls onEdit when Edit Info is clicked", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<GroupBasicInfoSection group={GROUP} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /edit info/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("deletes the group and navigates to /groups on confirm", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(deleteGroupAction).mockResolvedValue({ success: true });

    render(<GroupBasicInfoSection group={GROUP} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /delete group/i }));
    await user.click(screen.getByRole("button", { name: /confirm delete/i }));

    await vi.waitFor(() => expect(routerPush).toHaveBeenCalledWith("/groups"));
    expect(deleteGroupAction).toHaveBeenCalledWith("group-1");
  });

  it("shows the server's error on delete failure", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(deleteGroupAction).mockResolvedValue({ success: false, error: "Cannot delete group" });

    render(<GroupBasicInfoSection group={GROUP} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /delete group/i }));
    await user.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(await screen.findByText("Cannot delete group")).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});

describe("GroupBasicInfoSection — edit mode", () => {
  it("pre-fills the form from the group", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<GroupBasicInfoSection group={GROUP} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByLabelText("Group Name")).toHaveValue("Engineering");
    expect(screen.getByLabelText("Description")).toHaveValue("The engineering team");
  });

  it("submits the updated fields and calls onSuccess", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateGroupAction).mockResolvedValue({ success: true, group: GROUP });

    render(<GroupBasicInfoSection group={GROUP} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />);
    await user.clear(screen.getByLabelText("Group Name"));
    await user.type(screen.getByLabelText("Group Name"), "New Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateGroupAction).toHaveBeenCalledWith("group-1", expect.objectContaining({ name: "New Name" }));
  });

  it("shows the server's error message on update failure", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(updateGroupAction).mockResolvedValue({ success: false, error: "Update failed" });

    render(<GroupBasicInfoSection group={GROUP} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Update failed")).toBeInTheDocument();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<GroupBasicInfoSection group={GROUP} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
