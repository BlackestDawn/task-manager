import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserPasswordSection from "./userPasswordSection";
import { updateUserPasswordAction } from "@/lib/actions/users";

vi.mock("@/lib/actions/users", () => ({
  updateUserPasswordAction: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(updateUserPasswordAction).mockReset();
});

describe("UserPasswordSection — view mode", () => {
  it("calls onEdit when the Change Password button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<UserPasswordSection userId="user-1" isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

describe("UserPasswordSection — edit mode", () => {
  it("shows a client-side error for a password under 8 characters, without calling the action", async () => {
    const user = userEvent.setup();

    render(<UserPasswordSection userId="user-1" isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText("New Password"), "short");
    await user.type(screen.getByLabelText("Confirm New Password"), "short");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText("Password must be at least 8 characters long")).toBeInTheDocument();
    expect(updateUserPasswordAction).not.toHaveBeenCalled();
  });

  it("shows a client-side error when passwords don't match, without calling the action", async () => {
    const user = userEvent.setup();

    render(<UserPasswordSection userId="user-1" isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText("New Password"), "password123");
    await user.type(screen.getByLabelText("Confirm New Password"), "password456");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(updateUserPasswordAction).not.toHaveBeenCalled();
  });

  it("submits the new password and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateUserPasswordAction).mockResolvedValue({ success: true });

    render(<UserPasswordSection userId="user-1" isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText("New Password"), "password123");
    await user.type(screen.getByLabelText("Confirm New Password"), "password123");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateUserPasswordAction).toHaveBeenCalledWith("user-1", { password: "password123" });
  });

  it("shows the server's error message on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(updateUserPasswordAction).mockResolvedValue({ success: false, error: "Password update failed" });

    render(<UserPasswordSection userId="user-1" isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText("New Password"), "password123");
    await user.type(screen.getByLabelText("Confirm New Password"), "password123");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText("Password update failed")).toBeInTheDocument();
  });

  it("toggles password and confirm-password visibility independently", async () => {
    const user = userEvent.setup();

    render(<UserPasswordSection userId="user-1" isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    const passwordInput = screen.getByLabelText("New Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm New Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");
    expect(confirmInput.type).toBe("password");

    await user.click(passwordInput.parentElement!.querySelector("button")!);
    expect(passwordInput.type).toBe("text");
    expect(confirmInput.type).toBe("password");

    await user.click(confirmInput.parentElement!.querySelector("button")!);
    expect(confirmInput.type).toBe("text");
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<UserPasswordSection userId="user-1" isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
