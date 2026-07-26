import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type User } from "@task-manager/common";
import CreateUserForm from "./createUserForm";
import { createUserAction } from "@/lib/actions/users";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/lib/actions/users", () => ({
  createUserAction: vi.fn(),
}));

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

// CreateUserForm only ever destructures `user` off the context.
const UNUSED_ABILITY = defineAbilityFor(null);

function mockCurrentUser(overrides: Partial<User> = {}) {
  const user: User = {
    __typename: "User",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "current",
    name: "Current User",
    email: null,
    disabled: false,
    accessLevel: "admin",
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

beforeEach(() => {
  vi.mocked(createUserAction).mockReset();
});

describe("CreateUserForm — access level visibility", () => {
  it("shows all access levels for an admin", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<CreateUserForm />);

    const select = screen.getByLabelText(/access level/i);
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toEqual(["admin", "manager", "user"]);
  });

  it("hides the admin option for a manager and shows the admin-restriction notice", () => {
    mockCurrentUser({ accessLevel: "manager" });
    render(<CreateUserForm />);

    const select = screen.getByLabelText(/access level/i);
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toEqual(["manager", "user"]);
    expect(screen.getByText(/cannot create admin users/i)).toBeInTheDocument();
  });

  it("hides the access level select entirely for a plain user", () => {
    mockCurrentUser({ accessLevel: "user" });
    render(<CreateUserForm />);

    expect(screen.queryByLabelText(/access level/i)).not.toBeInTheDocument();
  });
});

describe("CreateUserForm — submission", () => {
  it("submits the form and calls onSuccess", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(createUserAction).mockResolvedValue({
      success: true,
      user: { __typename: "User", id: "1", createdAt: new Date(), updatedAt: new Date(), login: "newuser", name: "New User", email: null, disabled: false, accessLevel: "user", groups: [] },
    });

    render(<CreateUserForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Login"), "newuser");
    await user.type(screen.getByLabelText("Full Name"), "New User");
    await user.type(screen.getByLabelText("Password"), "securePassword123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(createUserAction).toHaveBeenCalledWith({
      login: "newuser",
      password: "securePassword123",
      name: "New User",
      email: null,
      accessLevel: "user",
    });
  });

  it("submits the selected access level", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(createUserAction).mockResolvedValue({
      success: true,
      user: { __typename: "User", id: "1", createdAt: new Date(), updatedAt: new Date(), login: "newmgr", name: "New Manager", email: null, disabled: false, accessLevel: "manager", groups: [] },
    });

    render(<CreateUserForm />);
    await user.type(screen.getByLabelText("Login"), "newmgr");
    await user.type(screen.getByLabelText("Full Name"), "New Manager");
    await user.type(screen.getByLabelText("Password"), "securePassword123");
    await user.selectOptions(screen.getByLabelText(/access level/i), "manager");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await vi.waitFor(() =>
      expect(createUserAction).toHaveBeenCalledWith(expect.objectContaining({ accessLevel: "manager" }))
    );
  });

  it("sends null for an empty email", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(createUserAction).mockResolvedValue({
      success: true,
      user: { __typename: "User", id: "1", createdAt: new Date(), updatedAt: new Date(), login: "newuser", name: "New User", email: null, disabled: false, accessLevel: "user", groups: [] },
    });

    render(<CreateUserForm />);
    await user.type(screen.getByLabelText("Login"), "newuser");
    await user.type(screen.getByLabelText("Full Name"), "New User");
    await user.type(screen.getByLabelText("Password"), "securePassword123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await vi.waitFor(() =>
      expect(createUserAction).toHaveBeenCalledWith(expect.objectContaining({ email: null }))
    );
  });

  it("shows a client-side error for a whitespace-only login without calling the action", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();

    render(<CreateUserForm />);
    await user.type(screen.getByLabelText("Login"), "   ");
    await user.type(screen.getByLabelText("Full Name"), "New User");
    await user.type(screen.getByLabelText("Password"), "securePassword123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    expect(await screen.findByText("Login is required")).toBeInTheDocument();
    expect(createUserAction).not.toHaveBeenCalled();
  });

  it("shows the server's error message on failure", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    vi.mocked(createUserAction).mockResolvedValue({ success: false, error: "User already exists" });

    render(<CreateUserForm />);
    await user.type(screen.getByLabelText("Login"), "newuser");
    await user.type(screen.getByLabelText("Full Name"), "New User");
    await user.type(screen.getByLabelText("Password"), "securePassword123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();

    render(<CreateUserForm />);
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // The toggle button has no accessible name beyond the icon — select it
    // as the only other button in the password field's wrapper.
    const toggleButton = passwordInput.parentElement!.querySelector("button")!;
    await user.click(toggleButton);

    expect(passwordInput.type).toBe("text");
  });

  it("calls onCancel when the header close button is clicked", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<CreateUserForm onCancel={onCancel} />);
    // The header's X button has no accessible name of its own, so scope
    // the query to the header (the password-visibility toggle is also
    // unlabeled, but lives in the form body, not the header).
    const header = screen.getByText("Create New User").closest("div")!;
    await user.click(within(header).getByRole("button"));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
