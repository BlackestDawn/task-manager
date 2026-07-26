import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Group } from "@task-manager/common";
import TaskGroupsSection from "./taskGroupsSection";

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

describe("TaskGroupsSection", () => {
  it("shows an empty state when there are no groups", () => {
    render(<TaskGroupsSection groups={[]} />);
    expect(screen.getByText("This task is not assigned to any groups")).toBeInTheDocument();
  });

  it("renders each group's name, description, and view link", () => {
    render(
      <TaskGroupsSection
        groups={[makeGroup({ id: "g1", name: "Engineering", description: "The eng team" })]}
      />
    );

    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("The eng team")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view group/i })).toHaveAttribute("href", "/groups/g1");
  });

  it("uses singular 'group' for exactly one group", () => {
    render(<TaskGroupsSection groups={[makeGroup()]} />);
    expect(screen.getByText(/assigned to 1 group\./)).toBeInTheDocument();
  });

  it("uses plural 'groups' for more than one group", () => {
    render(<TaskGroupsSection groups={[makeGroup({ id: "g1" }), makeGroup({ id: "g2" })]} />);
    expect(screen.getByText(/assigned to 2 groups\./)).toBeInTheDocument();
  });
});
