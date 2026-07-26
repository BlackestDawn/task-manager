import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type Group, type Task, type User } from "@task-manager/common";
import GroupTasksListSection from "./groupTasksListSection";
import { removeTaskFromGroupAction, assignTaskToGroupAction } from "@/lib/actions/groups";
import { getTasksAction } from "@/lib/actions/tasks";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/lib/actions/groups", () => ({
  removeTaskFromGroupAction: vi.fn(),
  assignTaskToGroupAction: vi.fn(),
}));

vi.mock("@/lib/actions/tasks", () => ({
  getTasksAction: vi.fn(),
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

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "task-1",
    userId: "current-1",
    title: "Task One",
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

const reloadMock = vi.fn();
Object.defineProperty(window, "location", {
  configurable: true,
  value: { ...window.location, reload: reloadMock },
});

beforeEach(() => {
  vi.mocked(removeTaskFromGroupAction).mockReset();
  vi.mocked(assignTaskToGroupAction).mockReset();
  vi.mocked(getTasksAction).mockReset().mockResolvedValue([]);
  reloadMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GroupTasksListSection — view mode", () => {
  it("shows an empty state and hides Assign Tasks for a user without assign permission", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(<GroupTasksListSection group={GROUP} tasks={[]} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText("No tasks assigned to this group yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /assign tasks/i })).not.toBeInTheDocument();
  });

  it("shows Assign Tasks in the empty state for an admin, calling onEdit", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<GroupTasksListSection group={GROUP} tasks={[]} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /assign tasks/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("renders assigned tasks as links and hides Manage Tasks for a user without permission", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(
      <GroupTasksListSection group={GROUP} tasks={[makeTask({ id: "t1", title: "Ship the feature" })]} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByRole("link", { name: "Ship the feature" })).toHaveAttribute("href", "/tasks/t1");
    expect(screen.queryByRole("button", { name: /manage tasks/i })).not.toBeInTheDocument();
  });

  it("shows Manage Tasks for an admin with assigned tasks, calling onEdit", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <GroupTasksListSection group={GROUP} tasks={[makeTask()]} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /manage tasks/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

describe("GroupTasksListSection — edit mode", () => {
  it("falls back to the view-mode list when isEditing is true but the user lacks manage permission", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(
      <GroupTasksListSection group={GROUP} tasks={[makeTask({ title: "Ship the feature" })]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.queryByRole("button", { name: /done/i })).not.toBeInTheDocument();
    expect(screen.getByText("Ship the feature")).toBeInTheDocument();
  });

  it("loads assignable tasks and assigns the selected one", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(getTasksAction).mockResolvedValue([makeTask({ id: "t2", title: "Unassigned Task" })]);
    vi.mocked(assignTaskToGroupAction).mockResolvedValue({ success: true });

    render(
      <GroupTasksListSection group={GROUP} tasks={[]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    await user.click(await screen.findByRole("button", { name: /assign task/i }));
    await user.selectOptions(screen.getByLabelText(/select task/i), "t2");
    await user.click(screen.getByRole("button", { name: /assign to group/i }));

    await vi.waitFor(() =>
      expect(assignTaskToGroupAction).toHaveBeenCalledWith("group-1", { taskId: "t2", assignedBy: "current-1" })
    );
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("disables the Assign to Group button until a task is selected", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(getTasksAction).mockResolvedValue([makeTask({ id: "t2", title: "Unassigned Task" })]);

    render(
      <GroupTasksListSection group={GROUP} tasks={[]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(await screen.findByRole("button", { name: /assign task/i }));

    expect(screen.getByRole("button", { name: /assign to group/i })).toBeDisabled();
  });

  it("removes a task and calls onSuccess", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(removeTaskFromGroupAction).mockResolvedValue({ success: true });

    render(
      <GroupTasksListSection group={GROUP} tasks={[makeTask({ id: "t1", title: "Ship the feature" })]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />
    );
    await user.click(screen.getByRole("button", { name: /remove/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(removeTaskFromGroupAction).toHaveBeenCalledWith("group-1", { taskId: "t1" });
  });

  it("shows the server's error message when removing a task fails", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(removeTaskFromGroupAction).mockResolvedValue({ success: false, error: "Cannot remove task" });

    render(
      <GroupTasksListSection group={GROUP} tasks={[makeTask({ id: "t1" })]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /remove/i }));

    expect(await screen.findByText("Cannot remove task")).toBeInTheDocument();
  });

  it("shows an error banner when loading assignable tasks fails", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    vi.mocked(getTasksAction).mockRejectedValue(new Error("network error"));

    render(
      <GroupTasksListSection group={GROUP} tasks={[]} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(await screen.findByText("Failed to load tasks")).toBeInTheDocument();
  });

  it("calls onCancel when the Done button is clicked", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <GroupTasksListSection group={GROUP} tasks={[]} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
