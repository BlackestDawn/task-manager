import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Task } from "@task-manager/common";
import TaskStatusBadge from "./taskStatusBadge";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "task-1",
    userId: "user-1",
    title: "Title",
    description: "",
    finishBy: null,
    completed: false,
    completedAt: null,
    groups: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("TaskStatusBadge", () => {
  it("shows 'Completed' for a completed task, even if its due date has passed", () => {
    render(<TaskStatusBadge task={makeTask({ completed: true, finishBy: new Date(2020, 0, 1) })} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("shows 'Overdue' for an incomplete task with a past due date", () => {
    render(<TaskStatusBadge task={makeTask({ completed: false, finishBy: new Date(2020, 0, 1) })} />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("shows 'In Progress' for an incomplete task with a future due date", () => {
    render(<TaskStatusBadge task={makeTask({ completed: false, finishBy: new Date(2099, 0, 1) })} />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("shows 'In Progress' for an incomplete task with no due date", () => {
    render(<TaskStatusBadge task={makeTask({ completed: false, finishBy: null })} />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });
});
