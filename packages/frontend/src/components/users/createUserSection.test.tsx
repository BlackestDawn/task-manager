import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type AppAbility } from "@task-manager/common";
import CreateUserSection from "./createUserSection";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

// createUserForm has its own dedicated test suite — stub it here so this
// file only exercises createUserSection's own job: gating + toggling.
vi.mock("./createUserForm", () => ({
  default: ({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) => (
    <div>
      <p>CreateUserForm stub</p>
      <button onClick={onSuccess}>stub-success</button>
      <button onClick={onCancel}>stub-cancel</button>
    </div>
  ),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function mockAbility(ability: AppAbility) {
  vi.mocked(useAuthContext).mockReturnValue({
    ability,
    user: null,
    isAuthenticated: false,
    refreshAuth: async () => {},
  });
}

describe("CreateUserSection", () => {
  it("shows the add user button for a manager", () => {
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "manager" }));

    render(<CreateUserSection />);

    expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
  });

  it("hides the add user button for a plain user", () => {
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "user" }));

    render(<CreateUserSection />);

    expect(screen.queryByRole("button", { name: /add user/i })).not.toBeInTheDocument();
  });

  it("shows the form after clicking add user, and returns to the button on cancel", async () => {
    const user = userEvent.setup();
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "manager" }));

    render(<CreateUserSection />);
    await user.click(screen.getByRole("button", { name: /add user/i }));

    expect(screen.getByText("CreateUserForm stub")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "stub-cancel" }));

    expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
    expect(screen.queryByText("CreateUserForm stub")).not.toBeInTheDocument();
  });

  it("returns to the button on success too", async () => {
    const user = userEvent.setup();
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "manager" }));

    render(<CreateUserSection />);
    await user.click(screen.getByRole("button", { name: /add user/i }));
    await user.click(screen.getByRole("button", { name: "stub-success" }));

    expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
  });
});
