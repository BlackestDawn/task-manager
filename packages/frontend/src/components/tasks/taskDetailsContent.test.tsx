import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type Task, type User } from "@task-manager/common";
import TaskDetailsContent from "./taskDetailsContent";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

// TaskBasicInfoSection and TaskStatusSection have their own dedicated test
// suites — stub them here so this file only exercises TaskDetailsContent's
// own job: rendering task info, permission gating, and edit-section wiring.
vi.mock("./taskBasicInfoSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: { isEditing: boolean; onEdit: () => void; onCancel: () => void; onSuccess: () => void }) => (
    <div>
      <p>BasicInfo stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>basic-edit</button>
      <button onClick={onCancel}>basic-cancel</button>
      <button onClick={onSuccess}>basic-success</button>
    </div>
  ),
}));

vi.mock("./taskStatusSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: { isEditing: boolean; onEdit: () => void; onCancel: () => void; onSuccess: () => void }) => (
    <div>
      <p>StatusSection stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>status-edit</button>
      <button onClick={onCancel}>status-cancel</button>
      <button onClick={onSuccess}>status-success</button>
    </div>
  ),
}));

const CURRENT_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "task-1",
    userId: CURRENT_USER_ID,
    title: "Ship the feature",
    description: "Finish the rollout",
    finishBy: null,
    completed: false,
    completedAt: null,
    groups: [],
    createdAt: new Date(2026, 0, 1),
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
    ability: defineAbilityFor(user),
    refreshAuth: async () => {},
  });
}

describe("TaskDetailsContent — task info", () => {
  it("renders the title and description", () => {
    mockCurrentUser();
    render(<TaskDetailsContent task={makeTask()} groups={[]} />);

    expect(screen.getByText("Ship the feature")).toBeInTheDocument();
    expect(screen.getByText("Finish the rollout")).toBeInTheDocument();
  });

  it("shows the completion date when the task is completed", () => {
    mockCurrentUser();
    render(
      <TaskDetailsContent
        task={makeTask({ completed: true, completedAt: new Date(2026, 6, 20) })}
        groups={[]}
      />
    );

    expect(screen.getByText(/Completed on/)).toBeInTheDocument();
  });

  it("hides the due date row when finishBy is null", () => {
    mockCurrentUser();
    render(<TaskDetailsContent task={makeTask({ finishBy: null })} groups={[]} />);

    expect(screen.queryByText("Due Date")).not.toBeInTheDocument();
  });

  it("shows the due date and marks it overdue for a past, incomplete task", () => {
    mockCurrentUser();
    render(
      <TaskDetailsContent
        task={makeTask({ finishBy: new Date(2020, 0, 1), completed: false })}
        groups={[]}
      />
    );

    expect(screen.getByText("Due Date")).toBeInTheDocument();
    expect(screen.getByText("(Overdue)")).toBeInTheDocument();
  });

  it("does not mark a past due date overdue once the task is completed", () => {
    mockCurrentUser();
    render(
      <TaskDetailsContent
        task={makeTask({ finishBy: new Date(2020, 0, 1), completed: true, completedAt: new Date(2020, 0, 2) })}
        groups={[]}
      />
    );

    expect(screen.queryByText("(Overdue)")).not.toBeInTheDocument();
  });

  it("uses singular 'group' for exactly one group and plural otherwise", () => {
    mockCurrentUser();
    const { rerender } = render(
      <TaskDetailsContent task={makeTask()} groups={[{ __typename: "Group", id: "g1", name: "Eng", description: null, createdAt: new Date(), updatedAt: new Date() }]} />
    );
    expect(screen.getByText("1 group")).toBeInTheDocument();

    rerender(<TaskDetailsContent task={makeTask()} groups={[]} />);
    expect(screen.getByText("0 groups")).toBeInTheDocument();
  });
});

describe("TaskDetailsContent — permission gating", () => {
  it("shows both editable sections for the task's owner", () => {
    mockCurrentUser({ id: CURRENT_USER_ID });
    render(<TaskDetailsContent task={makeTask({ userId: CURRENT_USER_ID })} groups={[]} />);

    expect(screen.getByText(/BasicInfo stub/)).toBeInTheDocument();
    expect(screen.getByText(/StatusSection stub/)).toBeInTheDocument();
  });

  it("hides both editable sections for a user with no relationship to the task", () => {
    mockCurrentUser({ id: "other-user", groups: [] });
    render(<TaskDetailsContent task={makeTask({ userId: CURRENT_USER_ID })} groups={[]} />);

    expect(screen.queryByText(/BasicInfo stub/)).not.toBeInTheDocument();
    expect(screen.queryByText(/StatusSection stub/)).not.toBeInTheDocument();
  });
});

describe("TaskDetailsContent — edit-section wiring", () => {
  it("opens only the basic-info section for editing, independent of the status section", async () => {
    mockCurrentUser({ id: CURRENT_USER_ID });
    const user = userEvent.setup();

    render(<TaskDetailsContent task={makeTask({ userId: CURRENT_USER_ID })} groups={[]} />);
    expect(screen.getByText("BasicInfo stub (editing: false)")).toBeInTheDocument();
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "basic-edit" }));

    expect(screen.getByText("BasicInfo stub (editing: true)")).toBeInTheDocument();
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();
  });

  it("closes the section on cancel and on success", async () => {
    mockCurrentUser({ id: CURRENT_USER_ID });
    const user = userEvent.setup();

    render(<TaskDetailsContent task={makeTask({ userId: CURRENT_USER_ID })} groups={[]} />);

    await user.click(screen.getByRole("button", { name: "status-edit" }));
    expect(screen.getByText("StatusSection stub (editing: true)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "status-cancel" }));
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "status-edit" }));
    await user.click(screen.getByRole("button", { name: "status-success" }));
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();
  });
});
