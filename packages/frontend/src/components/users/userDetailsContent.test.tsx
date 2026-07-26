import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type Task, type User } from "@task-manager/common";
import UserDetailsContent from "./userDetailsContent";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

// UserBasicInfoSection, UserPasswordSection, and UserStatusSection each have
// their own dedicated test suites — stub them here so this file only
// exercises UserDetailsContent's own job: rendering user info, permission
// gating, and edit-section wiring.
type StubProps = { isEditing: boolean; onEdit: () => void; onCancel: () => void; onSuccess: () => void };

vi.mock("./userBasicInfoSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: StubProps) => (
    <div>
      <p>BasicInfo stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>basic-edit</button>
      <button onClick={onCancel}>basic-cancel</button>
      <button onClick={onSuccess}>basic-success</button>
    </div>
  ),
}));

vi.mock("./userPasswordSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: StubProps) => (
    <div>
      <p>PasswordSection stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>password-edit</button>
      <button onClick={onCancel}>password-cancel</button>
      <button onClick={onSuccess}>password-success</button>
    </div>
  ),
}));

vi.mock("./userStatusSection", () => ({
  default: ({ isEditing, onEdit, onCancel, onSuccess }: StubProps) => (
    <div>
      <p>StatusSection stub (editing: {String(isEditing)})</p>
      <button onClick={onEdit}>status-edit</button>
      <button onClick={onCancel}>status-cancel</button>
      <button onClick={onSuccess}>status-success</button>
    </div>
  ),
}));

const CURRENT_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: OTHER_USER_ID,
    createdAt: new Date(2026, 0, 1),
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

describe("UserDetailsContent — user info", () => {
  it("renders the name and login", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<UserDetailsContent user={makeUser({ name: "Target User", login: "target" })} tasks={[]} groups={[]} />);

    expect(screen.getByText("Target User")).toBeInTheDocument();
    expect(screen.getByText("@target")).toBeInTheDocument();
  });

  it("shows the 'You' badge when viewing your own profile", () => {
    mockCurrentUser({ id: CURRENT_USER_ID, accessLevel: "admin" });
    render(<UserDetailsContent user={makeUser({ id: CURRENT_USER_ID })} tasks={[]} groups={[]} />);

    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("hides the 'You' badge when viewing someone else's profile", () => {
    mockCurrentUser({ id: CURRENT_USER_ID, accessLevel: "admin" });
    render(<UserDetailsContent user={makeUser({ id: OTHER_USER_ID })} tasks={[]} groups={[]} />);

    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });

  it("shows a placeholder when the user has no email", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<UserDetailsContent user={makeUser({ email: null })} tasks={[]} groups={[]} />);

    expect(screen.getByText("No email provided")).toBeInTheDocument();
  });

  it("shows the access level badge", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<UserDetailsContent user={makeUser({ accessLevel: "manager" })} tasks={[]} groups={[]} />);

    expect(screen.getByText("Manager")).toBeInTheDocument();
  });

  it("shows Active or Disabled status", () => {
    mockCurrentUser({ accessLevel: "admin" });
    const { rerender } = render(<UserDetailsContent user={makeUser({ disabled: false })} tasks={[]} groups={[]} />);
    expect(screen.getByText("Active")).toBeInTheDocument();

    rerender(<UserDetailsContent user={makeUser({ disabled: true })} tasks={[]} groups={[]} />);
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("uses singular/plural task and group counts", () => {
    mockCurrentUser({ accessLevel: "admin" });
    const task: Task = {
      __typename: "Task",
      id: "t1",
      userId: OTHER_USER_ID,
      title: "A task",
      description: "",
      finishBy: null,
      completed: false,
      completedAt: null,
      groups: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <UserDetailsContent
        user={makeUser({ groups: [{ id: "g1", role: "user" }] })}
        tasks={[task]}
        groups={[]}
      />
    );

    expect(screen.getByText("1 task")).toBeInTheDocument();
    expect(screen.getByText("1 group")).toBeInTheDocument();
  });
});

describe("UserDetailsContent — permission gating", () => {
  it("shows all three editable sections for an admin viewing someone else", () => {
    mockCurrentUser({ accessLevel: "admin" });
    render(<UserDetailsContent user={makeUser()} tasks={[]} groups={[]} />);

    expect(screen.getByText(/BasicInfo stub/)).toBeInTheDocument();
    expect(screen.getByText(/PasswordSection stub/)).toBeInTheDocument();
    expect(screen.getByText(/StatusSection stub/)).toBeInTheDocument();
  });

  it("hides all three editable sections for a plain user viewing someone else", () => {
    mockCurrentUser({ accessLevel: "user", groups: [] });
    render(<UserDetailsContent user={makeUser()} tasks={[]} groups={[]} />);

    expect(screen.queryByText(/BasicInfo stub/)).not.toBeInTheDocument();
    expect(screen.queryByText(/PasswordSection stub/)).not.toBeInTheDocument();
    expect(screen.queryByText(/StatusSection stub/)).not.toBeInTheDocument();
  });

  it("shows the basic-info and password sections for a plain user viewing their own profile", () => {
    mockCurrentUser({ id: CURRENT_USER_ID, accessLevel: "user", groups: [] });
    render(<UserDetailsContent user={makeUser({ id: CURRENT_USER_ID })} tasks={[]} groups={[]} />);

    expect(screen.getByText(/BasicInfo stub/)).toBeInTheDocument();
    expect(screen.getByText(/PasswordSection stub/)).toBeInTheDocument();
  });

  it("hides the status section for a plain user viewing their own profile (self-disable is forbidden)", () => {
    mockCurrentUser({ id: CURRENT_USER_ID, accessLevel: "user", groups: [] });
    render(<UserDetailsContent user={makeUser({ id: CURRENT_USER_ID })} tasks={[]} groups={[]} />);

    expect(screen.queryByText(/StatusSection stub/)).not.toBeInTheDocument();
  });
});

describe("UserDetailsContent — edit-section wiring", () => {
  it("only ever has one editable section open at a time", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    render(<UserDetailsContent user={makeUser()} tasks={[]} groups={[]} />);

    await user.click(screen.getByRole("button", { name: "basic-edit" }));
    expect(screen.getByText("BasicInfo stub (editing: true)")).toBeInTheDocument();
    expect(screen.getByText("PasswordSection stub (editing: false)")).toBeInTheDocument();
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "password-edit" }));
    expect(screen.getByText("BasicInfo stub (editing: false)")).toBeInTheDocument();
    expect(screen.getByText("PasswordSection stub (editing: true)")).toBeInTheDocument();
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();
  });

  it("closes the section on cancel and on success", async () => {
    mockCurrentUser({ accessLevel: "admin" });
    const user = userEvent.setup();
    render(<UserDetailsContent user={makeUser()} tasks={[]} groups={[]} />);

    await user.click(screen.getByRole("button", { name: "status-edit" }));
    expect(screen.getByText("StatusSection stub (editing: true)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "status-cancel" }));
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "status-edit" }));
    await user.click(screen.getByRole("button", { name: "status-success" }));
    expect(screen.getByText("StatusSection stub (editing: false)")).toBeInTheDocument();
  });
});
