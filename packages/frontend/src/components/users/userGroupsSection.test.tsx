import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Group } from "@task-manager/common";
import UserGroupsSection from "./userGroupsSection";

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    __typename: "Group",
    id: "group-1",
    name: "Engineering",
    description: "The engineering team",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("UserGroupsSection", () => {
  it("shows an empty state when there are no groups", () => {
    render(<UserGroupsSection groups={[]} />);
    expect(screen.getByText("This user is not a member of any groups")).toBeInTheDocument();
  });

  it("renders each group's name, description, and view link", () => {
    render(
      <UserGroupsSection
        groups={[makeGroup({ id: "g1", name: "Engineering", description: "The eng team" })]}
      />
    );

    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("The eng team")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view group/i })).toHaveAttribute("href", "/groups/g1");
  });

  it("uses singular 'group' for exactly one group", () => {
    render(<UserGroupsSection groups={[makeGroup()]} />);
    expect(screen.getByText(/member of 1 group\./)).toBeInTheDocument();
  });

  it("uses plural 'groups' for more than one group", () => {
    render(<UserGroupsSection groups={[makeGroup({ id: "g1" }), makeGroup({ id: "g2" })]} />);
    expect(screen.getByText(/member of 2 groups\./)).toBeInTheDocument();
  });
});
