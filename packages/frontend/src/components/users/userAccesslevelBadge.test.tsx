import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserAccesslevelBadge from "./userAccesslevelBadge";

describe("UserAccesslevelBadge", () => {
  it("shows 'Admin' for the admin access level", () => {
    render(<UserAccesslevelBadge accessLevel="admin" />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows 'Manager' for the manager access level", () => {
    render(<UserAccesslevelBadge accessLevel="manager" />);
    expect(screen.getByText("Manager")).toBeInTheDocument();
  });

  it("shows 'User' for the user access level", () => {
    render(<UserAccesslevelBadge accessLevel="user" />);
    expect(screen.getByText("User")).toBeInTheDocument();
  });
});
