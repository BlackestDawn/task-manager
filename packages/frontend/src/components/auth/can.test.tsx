import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { defineAbilityFor, type AppAbility } from "@task-manager/common";
import { Can, Cannot } from "./can";
import { useAuthContext } from "./clientAuthProvider";

vi.mock("./clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

// Can/Cannot only ever destructure `ability` off the context — the other
// fields are irrelevant here, so this stub only needs to satisfy the type.
function mockAbility(ability: AppAbility) {
  vi.mocked(useAuthContext).mockReturnValue({
    ability,
    user: null,
    isAuthenticated: false,
    refreshAuth: async () => {},
  });
}

describe("Can", () => {
  it("renders its children when the ability grants the action", () => {
    const ability = defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "admin" });
    mockAbility(ability);

    render(
      <Can I="manage" a="all">
        <div>Protected Content</div>
      </Can>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders nothing when the ability does not grant the action", () => {
    const ability = defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "user" });
    mockAbility(ability);

    render(
      <Can I="create" a="Group">
        <div>Protected Content</div>
      </Can>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("respects a field-scoped check", () => {
    const ability = defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "user" });
    mockAbility(ability);
    const self = {
      __typename: "User" as const,
      id: USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
      login: "testuser",
      name: "Test User",
      email: null,
      disabled: false,
      accessLevel: "user" as const,
      groups: [],
    };

    render(
      <>
        <Can I="update" a={self} field="name">
          <div>Editable: name</div>
        </Can>
        <Can I="update" a={self} field="login">
          <div>Editable: login</div>
        </Can>
      </>
    );

    expect(screen.getByText("Editable: name")).toBeInTheDocument();
    expect(screen.queryByText("Editable: login")).not.toBeInTheDocument();
  });
});

describe("Cannot", () => {
  it("renders its children when the ability does not grant the action", () => {
    const ability = defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "user" });
    mockAbility(ability);

    render(
      <Cannot I="create" a="Group">
        <div>Upgrade to unlock group creation</div>
      </Cannot>
    );

    expect(screen.getByText("Upgrade to unlock group creation")).toBeInTheDocument();
  });

  it("renders nothing when the ability does grant the action", () => {
    const ability = defineAbilityFor({ id: USER_ID, groups: [], accessLevel: "manager" });
    mockAbility(ability);

    render(
      <Cannot I="create" a="Group">
        <div>Upgrade to unlock group creation</div>
      </Cannot>
    );

    expect(screen.queryByText("Upgrade to unlock group creation")).not.toBeInTheDocument();
  });
});
