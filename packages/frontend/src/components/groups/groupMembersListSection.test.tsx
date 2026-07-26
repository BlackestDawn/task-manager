import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type Group, type User } from "@task-manager/common";
import GroupMembersListSection from "./groupMembersListSection";
import { removeUserFromGroupAction, addUserToGroupAction } from "@/lib/actions/groups";
import { getUsersAction } from "@/lib/actions/users";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/lib/actions/groups", () => ({
  removeUserFromGroupAction: vi.fn(),
  addUserToGroupAction: vi.fn(),
}));

vi.mock("@/lib/actions/users", () => ({
  getUsersAction: vi.fn(),
}));

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

const GROUP: Group = {
  __typename: "Group",
  id: "group-1",
  name: "Engineering",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeMember(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: "member-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "member",
    name: "Member One",
    email: "member@example.com",
    disabled: false,
    accessLevel: "user",
    groups: [{ id: "group-1", role: "user" }],
    ...overrides,
  };
}

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
    ability: defineAbilityFor(user),
    refreshAuth: async () => {},
  });
  return user;
}

beforeEach(() => {
  vi.mocked(removeUserFromGroupAction).mockReset();
  vi.mocked(addUserToGroupAction).mockReset();
  vi.mocked(getUsersAction).mockReset().mockResolvedValue([]);
});

describe("GroupMembersListSection — view mode", () => {
  it("shows an empty state and hides Add Members for a user without manage permission", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(<GroupMembersListSection group={GROUP} members={[]} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText("No members in this group yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add members/i })).not.toBeInTheDocument();
  });

  it("shows Add Members in the empty state for an admin, calling onEdit", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<GroupMembersListSection group={GROUP} members={[]} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /add members/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("renders each member's name, role badge, and disabled badge, and hides Manage Members without permission", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(
      <GroupMembersListSection
        group={GROUP}
        members={[makeMember({ id: "m1", name: "Jane Doe", disabled: true, groups: [{ id: "group-1", role: "editor" }] })]}
        isEditing={false}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByRole("link", { name: "Jane Doe" })).toHaveAttribute("href", "/users/m1");
    expect(screen.getByText("editor")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /manage members/i })).not.toBeInTheDocument();
  });

  it("shows Manage Members for an admin with existing members, calling onEdit", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <GroupMembersListSection group={GROUP} members={[makeMember()]} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /manage members/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

describe("GroupMembersListSection — edit mode", () => {
  it("falls back to the view-mode list when isEditing is true but the user lacks manage permission", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(
      <GroupMembersListSection group={GROUP} members={[makeMember({ name: "Jane Doe" })]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.queryByRole("button", { name: /done/i })).not.toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("loads assignable users and adds the selected one with the selected role", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(getUsersAction).mockResolvedValue([makeMember({ id: "u2", name: "New Member", login: "newmember", groups: [] })]);
    vi.mocked(addUserToGroupAction).mockResolvedValue({ success: true });
    const onSuccess = vi.fn();

    render(
      <GroupMembersListSection group={GROUP} members={[]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />
    );

    await user.click(await screen.findByRole("button", { name: /add member/i }));
    await user.selectOptions(screen.getByLabelText(/select user/i), "u2");
    await user.selectOptions(screen.getByLabelText(/group role/i), "editor");
    await user.click(screen.getByRole("button", { name: /add to group/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(addUserToGroupAction).toHaveBeenCalledWith("group-1", { userId: "u2", role: "editor" });
  });

  it("disables the Add to Group button until a user is selected", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(getUsersAction).mockResolvedValue([makeMember({ id: "u2", name: "New Member", groups: [] })]);

    render(
      <GroupMembersListSection group={GROUP} members={[]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(await screen.findByRole("button", { name: /add member/i }));

    expect(screen.getByRole("button", { name: /add to group/i })).toBeDisabled();
  });

  it("restricts available roles to below the current group role for a non-admin supervisor", async () => {
    mockCurrentUser({ accessLevel: "user", groups: [{ id: "group-1", role: "supervisor" }] });
    vi.mocked(getUsersAction).mockResolvedValue([makeMember({ id: "u2", name: "New Member", groups: [] })]);
    const user = userEvent.setup();

    render(
      <GroupMembersListSection group={GROUP} members={[]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(await screen.findByRole("button", { name: /add member/i }));

    const roleSelect = screen.getByLabelText(/group role/i);
    const options = Array.from(roleSelect.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toEqual(["editor", "user", "viewer", "none"]);
  });

  it("removes a member and calls onSuccess", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(removeUserFromGroupAction).mockResolvedValue({ success: true });
    const onSuccess = vi.fn();

    render(
      <GroupMembersListSection group={GROUP} members={[makeMember({ id: "m1" })]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />
    );
    await user.click(screen.getByRole("button", { name: /remove/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(removeUserFromGroupAction).toHaveBeenCalledWith("group-1", { userId: "m1" });
  });

  it("shows the server's error message when removing a member fails", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(removeUserFromGroupAction).mockResolvedValue({ success: false, error: "Cannot remove member" });

    render(
      <GroupMembersListSection group={GROUP} members={[makeMember({ id: "m1" })]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /remove/i }));

    expect(await screen.findByText("Cannot remove member")).toBeInTheDocument();
  });

  it("shows an error banner when loading assignable users fails", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    vi.mocked(getUsersAction).mockRejectedValue(new Error("network error"));

    render(
      <GroupMembersListSection group={GROUP} members={[]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(await screen.findByText("Failed to load users")).toBeInTheDocument();
  });

  it("calls onCancel when the Done button is clicked", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <GroupMembersListSection group={GROUP} members={[]} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
