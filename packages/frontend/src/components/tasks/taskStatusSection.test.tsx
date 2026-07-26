import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Task } from "@task-manager/common";
import TaskStatusSection from "./taskStatusSection";
import { updateTaskDoneStatusAction } from "@/lib/actions/tasks";

vi.mock("@/lib/actions/tasks", () => ({
  updateTaskDoneStatusAction: vi.fn(),
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "task-1",
    userId: "user-1",
    title: "Title",
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

beforeEach(() => {
  vi.mocked(updateTaskDoneStatusAction).mockReset();
});

describe("TaskStatusSection — view mode", () => {
  it("shows 'Task In Progress' for an incomplete task", () => {
    render(
      <TaskStatusSection task={makeTask({ completed: false })} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(screen.getByText("Task In Progress")).toBeInTheDocument();
  });

  it("shows 'Task Completed' and the completion date for a completed task", () => {
    render(
      <TaskStatusSection
        task={makeTask({ completed: true, completedAt: new Date(2026, 6, 25, 14, 30) })}
        isEditing={false}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    expect(screen.getByText("Task Completed")).toBeInTheDocument();
    expect(screen.getByText(/Completed on July 25, 2026/)).toBeInTheDocument();
  });

  it("calls onEdit when the Change Status button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <TaskStatusSection task={makeTask()} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /change status/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

describe("TaskStatusSection — edit mode", () => {
  it("toggles the status, calls the action with the flipped value, and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateTaskDoneStatusAction).mockResolvedValue({ success: true, task: makeTask({ completed: true }) });

    render(
      <TaskStatusSection task={makeTask({ completed: false })} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />
    );
    expect(screen.getByText(/marked as/).textContent).toMatch(/in progress/);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await user.click(toggle);

    expect(screen.getByText(/marked as/).textContent).toMatch(/completed/);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateTaskDoneStatusAction).toHaveBeenCalledWith("task-1", { completed: true });
  });

  it("reverts the optimistic toggle and shows an error on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(updateTaskDoneStatusAction).mockResolvedValue({ success: false, error: "Status update failed" });

    render(
      <TaskStatusSection task={makeTask({ completed: false })} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("switch"));

    expect(await screen.findByText("Status update failed")).toBeInTheDocument();
    expect(screen.getByText(/marked as/).textContent).toMatch(/in progress/);
  });

  it("calls onCancel when the Done button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <TaskStatusSection task={makeTask()} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
