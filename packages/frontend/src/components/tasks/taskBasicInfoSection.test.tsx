import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Task } from "@task-manager/common";
import TaskBasicInfoSection from "./taskBasicInfoSection";
import { updateTaskAction, deleteTaskAction } from "@/lib/actions/tasks";
import { useRouter } from "next/navigation";

vi.mock("@/lib/actions/tasks", () => ({
  updateTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const TASK: Task = {
  __typename: "Task",
  id: "task-1",
  userId: "user-1",
  title: "Original Title",
  description: "Original description",
  finishBy: new Date(2026, 6, 25),
  completed: false,
  completedAt: null,
  groups: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

let routerPush: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.mocked(updateTaskAction).mockReset();
  vi.mocked(deleteTaskAction).mockReset();

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

describe("TaskBasicInfoSection — view mode", () => {
  it("calls onEdit when the Edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <TaskBasicInfoSection task={TASK} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("shows a delete confirmation prompt after clicking Delete, dismissible via Cancel", async () => {
    const user = userEvent.setup();

    render(
      <TaskBasicInfoSection task={TASK} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.getByText("Delete this task?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(screen.queryByText("Delete this task?")).not.toBeInTheDocument();
  });

  it("deletes the task and navigates to /tasks on confirm", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteTaskAction).mockResolvedValue({ success: true });

    render(
      <TaskBasicInfoSection task={TASK} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /delete task/i }));

    await vi.waitFor(() => expect(routerPush).toHaveBeenCalledWith("/tasks"));
    expect(deleteTaskAction).toHaveBeenCalledWith("task-1");
  });

  it("shows the server's error and hides the confirmation on delete failure", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteTaskAction).mockResolvedValue({ success: false, error: "Cannot delete task" });

    render(
      <TaskBasicInfoSection task={TASK} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /delete task/i }));

    expect(await screen.findByText("Cannot delete task")).toBeInTheDocument();
    expect(screen.queryByText("Delete this task?")).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});

describe("TaskBasicInfoSection — edit mode", () => {
  it("pre-fills the form from the task", () => {
    render(
      <TaskBasicInfoSection task={TASK} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue("Original Title");
    expect(screen.getByLabelText(/description/i)).toHaveValue("Original description");
    expect(screen.getByLabelText(/due date/i)).toHaveValue("2026-07-25");
  });

  it("submits the updated fields and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateTaskAction).mockResolvedValue({ success: true, task: TASK });

    render(
      <TaskBasicInfoSection task={TASK} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />
    );
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), "Updated Title");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateTaskAction).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ title: "Updated Title" })
    );
  });

  it("clears finishBy to null when the due date is emptied", async () => {
    const user = userEvent.setup();
    vi.mocked(updateTaskAction).mockResolvedValue({ success: true, task: TASK });

    render(
      <TaskBasicInfoSection task={TASK} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.clear(screen.getByLabelText(/due date/i));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await vi.waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith("task-1", expect.objectContaining({ finishBy: null }))
    );
  });

  it("shows the server's error message on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(updateTaskAction).mockResolvedValue({ success: false, error: "Update failed" });

    render(
      <TaskBasicInfoSection task={TASK} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Update failed")).toBeInTheDocument();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <TaskBasicInfoSection task={TASK} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
