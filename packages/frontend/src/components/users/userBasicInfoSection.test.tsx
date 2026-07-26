import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type User } from "@task-manager/common";
import UserBasicInfoSection from "./userBasicInfoSection";
import { updateUserAction } from "@/lib/actions/users";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/lib/actions/users", () => ({
  updateUserAction: vi.fn(),
}));

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

// UserBasicInfoSection only ever destructures `user` off the context.
const UNUSED_ABILITY = defineAbilityFor(null);

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: "target-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "target",
    name: "Target User",
    email: "target@example.com",
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

function mockCurrentUser(overrides: Partial<User> = {}) {
  const user = makeUser({ id: "current-1", login: "current", name: "Current User", accessLevel: "admin", ...overrides });
  vi.mocked(useAuthContext).mockReturnValue({
    user,
    isAuthenticated: true,
    ability: UNUSED_ABILITY,
    refreshAuth: async () => {},
  });
}

beforeEach(() => {
  vi.mocked(updateUserAction).mockReset();
});

describe("UserBasicInfoSection — view mode", () => {
  it("calls onEdit when the Edit button is clicked", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <UserBasicInfoSection user={makeUser()} isEditing={false} onEdit={onEdit} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

describe("UserBasicInfoSection — edit mode", () => {
  it("pre-fills login, name, and email from the user", () => {
    mockCurrentUser();
    render(
      <UserBasicInfoSection user={makeUser()} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByLabelText("Login")).toHaveValue("target");
    expect(screen.getByLabelText("Full Name")).toHaveValue("Target User");
    expect(screen.getByLabelText(/email/i)).toHaveValue("target@example.com");
  });

  it("shows the access level select for an admin editing someone else", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(
      <UserBasicInfoSection user={makeUser({ accessLevel: "user" })} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByLabelText(/access level/i)).toBeInTheDocument();
  });

  it("hides the access level select when editing your own profile", () => {
    mockCurrentUser({ id: "same-id" });
    render(
      <UserBasicInfoSection user={makeUser({ id: "same-id" })} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.queryByLabelText(/access level/i)).not.toBeInTheDocument();
  });

  it("hides the access level select for a plain user", () => {
    mockCurrentUser({ accessLevel: "user" });
    render(
      <UserBasicInfoSection user={makeUser()} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.queryByLabelText(/access level/i)).not.toBeInTheDocument();
  });

  it("submits only the changed fields and calls onSuccess", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateUserAction).mockResolvedValue({ success: true, user: makeUser({ name: "New Name" }) });

    render(
      <UserBasicInfoSection user={makeUser()} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={onSuccess} />
    );
    await user.clear(screen.getByLabelText("Full Name"));
    await user.type(screen.getByLabelText("Full Name"), "New Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateUserAction).toHaveBeenCalledWith(
      "target-1",
      expect.objectContaining({ name: "New Name", login: "target", email: "target@example.com" })
    );
  });

  it("does not call the action and just cancels when nothing changed", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <UserBasicInfoSection user={makeUser()} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(updateUserAction).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("treats an untouched null email as unchanged, so an unedited null-email user just cancels without calling the action", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <UserBasicInfoSection user={makeUser({ email: null })} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(updateUserAction).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows the server's error message on failure", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    vi.mocked(updateUserAction).mockResolvedValue({ success: false, error: "Login already taken" });

    render(
      <UserBasicInfoSection user={makeUser()} isEditing={true} onEdit={vi.fn()} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );
    await user.clear(screen.getByLabelText("Login"));
    await user.type(screen.getByLabelText("Login"), "newlogin");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Login already taken")).toBeInTheDocument();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    mockCurrentUser();
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <UserBasicInfoSection user={makeUser()} isEditing={true} onEdit={vi.fn()} onCancel={onCancel} onSuccess={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
