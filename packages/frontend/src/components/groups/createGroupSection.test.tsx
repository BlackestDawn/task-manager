import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type AppAbility } from "@task-manager/common";
import CreateGroupSection from "./createGroupSection";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

// createGroupForm has its own dedicated test suite — stub it here so this
// file only exercises createGroupSection's own job: gating + toggling.
vi.mock("./createGroupForm", () => ({
  default: ({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) => (
    <div>
      <p>CreateGroupForm stub</p>
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

describe("CreateGroupSection", () => {
  it("shows the create button for a manager", () => {
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "manager" }));

    render(<CreateGroupSection />);

    expect(screen.getByRole("button", { name: /create group/i })).toBeInTheDocument();
  });

  it("hides the create button for a plain user", () => {
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "user" }));

    render(<CreateGroupSection />);

    expect(screen.queryByRole("button", { name: /create group/i })).not.toBeInTheDocument();
  });

  it("shows the form after clicking create, and returns to the button on cancel", async () => {
    const user = userEvent.setup();
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "manager" }));

    render(<CreateGroupSection />);
    await user.click(screen.getByRole("button", { name: /create group/i }));

    expect(screen.getByText("CreateGroupForm stub")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "stub-cancel" }));

    expect(screen.getByRole("button", { name: /create group/i })).toBeInTheDocument();
    expect(screen.queryByText("CreateGroupForm stub")).not.toBeInTheDocument();
  });

  it("returns to the button on success too", async () => {
    const user = userEvent.setup();
    mockAbility(defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "manager" }));

    render(<CreateGroupSection />);
    await user.click(screen.getByRole("button", { name: /create group/i }));
    await user.click(screen.getByRole("button", { name: "stub-success" }));

    expect(screen.getByRole("button", { name: /create group/i })).toBeInTheDocument();
  });
});
