import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@task-manager/common";
import UserStatusSection from "./userStatusSection";
import { updateUserDisabledAction } from "@/lib/actions/users";

vi.mock("@/lib/actions/users", () => ({
  updateUserDisabledAction: vi.fn(),
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "target",
    name: "Target User",
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(updateUserDisabledAction).mockReset();
});

describe("UserStatusSection — view mode", () => {
  it("shows active status and calls onEdit when Manage Status is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<UserStatusSection user={makeUser({ disabled: false })} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText("User account is active")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /manage status/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("shows disabled status", () => {
    render(<UserStatusSection user={makeUser({ disabled: true })} isEditing={false} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText("User account is disabled")).toBeInTheDocument();
  });
});

describe("UserStatusSection — edit mode", () => {
  it("disables the submit button until the toggle is changed, then shows a warning", async () => {
    const user = userEvent.setup();

    render(<UserStatusSection user={makeUser({ disabled: false })} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByRole("button", { name: /update status/i })).toBeDisabled();
    expect(screen.queryByText("Warning")).not.toBeInTheDocument();

    await user.click(screen.getByRole("switch"));

    expect(screen.getByRole("button", { name: /update status/i })).toBeEnabled();
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("submits the flipped disabled value and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateUserDisabledAction).mockResolvedValue({ success: true, user: makeUser({ disabled: true }) });

    render(<UserStatusSection user={makeUser({ disabled: false })} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />);
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: /update status/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateUserDisabledAction).toHaveBeenCalledWith("user-1", { disabled: true });
  });

  it("reverts the toggle and shows an error on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(updateUserDisabledAction).mockResolvedValue({ success: false, error: "Status update failed" });

    render(<UserStatusSection user={makeUser({ disabled: false })} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: /update status/i }));

    expect(await screen.findByText("Status update failed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update status/i })).toBeDisabled();
  });

  it("resets the toggle and calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<UserStatusSection user={makeUser({ disabled: false })} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("switch"));
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
