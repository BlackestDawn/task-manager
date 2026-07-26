import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type Group, type Task, type User } from "@task-manager/common";
import GroupDetailsContent from "./groupDetailsContent";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

// GroupDetailsContent only ever destructures `user` off the context.
const UNUSED_ABILITY = defineAbilityFor(null);

// GroupBasicInfoSection, GroupMembersListSection, and GroupTasksListSection
// each have their own dedicated test suites — stub them here so this file
// only exercises GroupDetailsContent's own job: tabs, stats, membership
// badge, and edit-section wiring.
type StubProps = { isEditing: boolean; onEdit: () => void; onCancel: () => void; onSuccess: () => void };

vi.mock("./groupBasicInfoSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: StubProps) => (
    <div>
      <p>BasicInfo stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>basic-edit</button>
      <button onClick={onCancel}>basic-cancel</button>
      <button onClick={onSuccess}>basic-success</button>
    </div>
  ),
}));

vi.mock("./groupMembersListSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: StubProps) => (
    <div>
      <p>MembersList stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>members-edit</button>
      <button onClick={onCancel}>members-cancel</button>
      <button onClick={onSuccess}>members-success</button>
    </div>
  ),
}));

vi.mock("./groupTasksListSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: StubProps) => (
    <div>
      <p>TasksList stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>tasks-edit</button>
      <button onClick={onCancel}>tasks-cancel</button>
      <button onClick={onSuccess}>tasks-success</button>
    </div>
  ),
}));

const CURRENT_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

const GROUP: Group = {
  __typename: "Group",
  id: "group-1",
  name: "Engineering",
  description: "The engineering team",
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
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "task-1",
    userId: "member-1",
    title: "A task",
    description: "",
    finishBy: null,
    completed: false,
    completedAt: null,
    groups: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function mockCurrentUser(overrides: Partial<User> = {}) {
  const user: User = {
    __typename: "User",
    id: CURRENT_USER_ID,
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

describe("GroupDetailsContent — header", () => {
  it("renders the group's name and description", () => {
    mockCurrentUser();
    render(<GroupDetailsContent group={GROUP} members={[]} tasks={[]} />);

    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("The engineering team")).toBeInTheDocument();
  });

  it("shows the Member badge when the current user is a member", () => {
    mockCurrentUser({ id: CURRENT_USER_ID });
    render(<GroupDetailsContent group={GROUP} members={[makeMember({ id: CURRENT_USER_ID })]} tasks={[]} />);

    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("hides the Member badge when the current user is not a member", () => {
    mockCurrentUser({ id: CURRENT_USER_ID });
    render(<GroupDetailsContent group={GROUP} members={[makeMember({ id: "someone-else" })]} tasks={[]} />);

    expect(screen.queryByText("Member")).not.toBeInTheDocument();
  });
});

describe("GroupDetailsContent — tabs", () => {
  it("shows the overview stats by default, including the completed-tasks count", () => {
    mockCurrentUser();
    render(
      <GroupDetailsContent
        group={GROUP}
        members={[makeMember()]}
        tasks={[makeTask({ completed: true }), makeTask({ id: "task-2", completed: false })]}
      />
    );

    expect(screen.getByText("Statistics")).toBeInTheDocument();
    expect(screen.getByText("Total Members")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0); // 1 member, 1 completed
    expect(screen.getByText("2")).toBeInTheDocument(); // 2 total tasks
  });

  it("shows the member and task counts in the tab labels", () => {
    mockCurrentUser();
    render(<GroupDetailsContent group={GROUP} members={[makeMember(), makeMember({ id: "m2" })]} tasks={[makeTask()]} />);

    expect(screen.getByRole("button", { name: /members \(2\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tasks \(1\)/i })).toBeInTheDocument();
  });

  it("switches to the members tab and renders the members list", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    render(<GroupDetailsContent group={GROUP} members={[makeMember()]} tasks={[]} />);

    await user.click(screen.getByRole("button", { name: /members/i }));

    expect(screen.getByText(/MembersList stub/)).toBeInTheDocument();
    expect(screen.queryByText("Statistics")).not.toBeInTheDocument();
  });

  it("switches to the tasks tab and renders the tasks list", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    render(<GroupDetailsContent group={GROUP} members={[]} tasks={[makeTask()]} />);

    await user.click(screen.getByRole("button", { name: /tasks/i }));

    expect(screen.getByText(/TasksList stub/)).toBeInTheDocument();
    expect(screen.queryByText("Statistics")).not.toBeInTheDocument();
  });
});

describe("GroupDetailsContent — edit-section wiring", () => {
  it("keeps the basic-info edit state independent of the active tab", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    render(<GroupDetailsContent group={GROUP} members={[]} tasks={[]} />);

    await user.click(screen.getByRole("button", { name: "basic-edit" }));
    expect(screen.getByText("BasicInfo stub (editing: true)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /members/i }));
    expect(screen.getByText("BasicInfo stub (editing: true)")).toBeInTheDocument();
  });

  it("closes the members section on success", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    render(<GroupDetailsContent group={GROUP} members={[]} tasks={[]} />);

    await user.click(screen.getByRole("button", { name: /members/i }));
    await user.click(screen.getByRole("button", { name: "members-edit" }));
    expect(screen.getByText("MembersList stub (editing: true)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "members-success" }));
    expect(screen.getByText("MembersList stub (editing: false)")).toBeInTheDocument();
  });
});
