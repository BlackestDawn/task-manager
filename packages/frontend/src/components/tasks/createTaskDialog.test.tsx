import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type User } from "@task-manager/common";
import CreateTaskDialog from "./createTaskDialog";
import { createTaskAction } from "@/lib/actions/tasks";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/lib/actions/tasks", () => ({
  createTaskAction: vi.fn(),
}));

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function mockCurrentUser() {
  const user: User = {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "current",
    name: "Current User",
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
  };
  vi.mocked(useAuthContext).mockReturnValue({
    user,
    isAuthenticated: true,
    ability: defineAbilityFor(user),
    refreshAuth: async () => {},
  });
}

beforeEach(() => {
  vi.mocked(createTaskAction).mockReset();
  mockCurrentUser();
});

describe("CreateTaskDialog", () => {
  it("renders nothing when isOpen is false", () => {
    render(<CreateTaskDialog isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText("Create New Task")).not.toBeInTheDocument();
  });

  it("renders the dialog when isOpen is true", () => {
    render(<CreateTaskDialog isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText("Create New Task")).toBeInTheDocument();
  });

  it("pre-fills the due date from prefilledDate", () => {
    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        prefilledDate={new Date(2026, 6, 25)}
      />
    );

    const dateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    expect(dateInput.value).toBe("2026-07-25");
  });

  it("submits the form with the current user's id and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(createTaskAction).mockResolvedValue({
      success: true,
      task: {
        __typename: "Task",
        id: "1",
        userId: USER_ID,
        title: "New Task",
        description: "",
        finishBy: null,
        completed: false,
        completedAt: null,
        groups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(<CreateTaskDialog isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText(/title/i), "New Task");
    await user.click(screen.getByRole("button", { name: /create task/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(createTaskAction).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID, title: "New Task", finishBy: null })
    );
  });

  it("submits a Date for finishBy when a due date is chosen", async () => {
    const user = userEvent.setup();
    vi.mocked(createTaskAction).mockResolvedValue({
      success: true,
      task: {
        __typename: "Task",
        id: "1",
        userId: USER_ID,
        title: "New Task",
        description: "",
        finishBy: new Date(2026, 6, 25),
        completed: false,
        completedAt: null,
        groups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(<CreateTaskDialog isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText(/title/i), "New Task");
    await user.type(screen.getByLabelText(/due date/i), "2026-07-25");
    await user.click(screen.getByRole("button", { name: /create task/i }));

    await vi.waitFor(() => expect(createTaskAction).toHaveBeenCalled());
    const call = vi.mocked(createTaskAction).mock.calls[0]![0];
    expect(call.finishBy).toBeInstanceOf(Date);
  });

  it("shows the server's error message on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(createTaskAction).mockResolvedValue({ success: false, error: "Task creation failed" });

    render(<CreateTaskDialog isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText(/title/i), "New Task");
    await user.click(screen.getByRole("button", { name: /create task/i }));

    expect(await screen.findByText("Task creation failed")).toBeInTheDocument();
  });

  it("disables the submit button while the title is empty", () => {
    render(<CreateTaskDialog isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByRole("button", { name: /create task/i })).toBeDisabled();
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<CreateTaskDialog isOpen={true} onClose={onClose} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the header close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<CreateTaskDialog isOpen={true} onClose={onClose} onSuccess={vi.fn()} />);
    // Unlike Cancel ("Cancel") and submit ("Create Task"), the X button has
    // no accessible name — it's the only button matching an empty name.
    await user.click(screen.getByRole("button", { name: "" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
