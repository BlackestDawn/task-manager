import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor, type Task, type User } from "@task-manager/common";
import TasksCalendar from "./tasksCalendar";
import { getTasksAction } from "@/lib/actions/tasks";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { useRouter } from "next/navigation";

vi.mock("@/lib/actions/tasks", () => ({
  getTasksAction: vi.fn(),
}));

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// CreateTaskDialog has its own dedicated test suite — stub it here so this
// file only exercises TasksCalendar's own job: calendar math, navigation,
// day/month selection, and permission gating for the create button.
vi.mock("@/components/tasks/createTaskDialog", () => ({
  default: ({ isOpen, onClose, onSuccess, prefilledDate }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; prefilledDate: Date | null }) =>
    isOpen ? (
      <div>
        <p>
          CreateTaskDialog stub (prefilledDate:{" "}
          {prefilledDate ? `${prefilledDate.getFullYear()}-${prefilledDate.getMonth() + 1}-${prefilledDate.getDate()}` : "null"})
        </p>
        <button onClick={onClose}>dialog-close</button>
        <button onClick={onSuccess}>dialog-success</button>
      </div>
    ) : null,
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const TODAY = new Date(2026, 6, 15); // Wednesday, July 15 2026

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "task-1",
    userId: USER_ID,
    title: "A task",
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

function mockAbility(user: Partial<User> | null) {
  const ability = user
    ? defineAbilityFor({ id: user.id ?? USER_ID, groups: user.groups ?? [], accessLevel: user.accessLevel ?? "user" })
    : defineAbilityFor(null);
  vi.mocked(useAuthContext).mockReturnValue({
    user: null,
    isAuthenticated: !!user,
    ability,
    refreshAuth: async () => {},
  });
}

function getNavButton(container: HTMLElement, iconClass: string): HTMLElement {
  const icon = container.querySelector(`.${iconClass}`);
  if (!icon) throw new Error(`No icon with class ${iconClass} found`);
  const button = icon.closest("button");
  if (!button) throw new Error(`Icon with class ${iconClass} is not inside a button`);
  return button;
}

let routerRefresh: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(TODAY);

  vi.mocked(getTasksAction).mockReset().mockResolvedValue([]);
  mockAbility({ accessLevel: "user" });

  routerRefresh = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push: vi.fn(),
    refresh: routerRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TasksCalendar — month view (default)", () => {
  it("shows the current month and year as the default label", () => {
    render(<TasksCalendar initialTasks={[]} />);
    expect(screen.getByText("July 2026")).toBeInTheDocument();
  });

  it("shows a task count badge on the day matching a task's due date", () => {
    render(<TasksCalendar initialTasks={[makeTask({ finishBy: new Date(2026, 6, 20) })]} />);
    expect(screen.getByText("1 task")).toBeInTheDocument();
  });

  it("navigates to the next and previous month, and back to today", async () => {
    const user = userEvent.setup();
    const { container } = render(<TasksCalendar initialTasks={[]} />);

    await user.click(getNavButton(container, "lucide-chevron-right"));
    expect(screen.getByText("August 2026")).toBeInTheDocument();

    await user.click(getNavButton(container, "lucide-chevron-left"));
    await user.click(getNavButton(container, "lucide-chevron-left"));
    expect(screen.getByText("June 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByText("July 2026")).toBeInTheDocument();
  });
});

describe("TasksCalendar — week view", () => {
  it("shows the week's date range as the label", async () => {
    const user = userEvent.setup();
    render(<TasksCalendar initialTasks={[]} />);
    await user.click(screen.getByRole("button", { name: "Week" }));

    expect(screen.getByText("Jul 13 - Jul 19, 2026")).toBeInTheDocument();
  });

  it("selects a day and lists tasks due on it", async () => {
    const user = userEvent.setup();
    render(<TasksCalendar initialTasks={[makeTask({ title: "Ship the feature", finishBy: new Date(2026, 6, 16) })]} />);
    await user.click(screen.getByRole("button", { name: "Week" }));
    await user.click(screen.getByText("16"));

    expect(screen.getByText("Tasks for Thursday, July 16, 2026")).toBeInTheDocument();
    expect(screen.getByText("Ship the feature")).toBeInTheDocument();
  });

  it("shows an empty state for a day with no tasks", async () => {
    const user = userEvent.setup();
    render(<TasksCalendar initialTasks={[]} />);
    await user.click(screen.getByRole("button", { name: "Week" }));
    await user.click(screen.getByText("14"));

    expect(screen.getByText("No tasks for this date")).toBeInTheDocument();
  });
});

describe("TasksCalendar — year view", () => {
  it("shows the year as the label and aggregates task counts per month", async () => {
    const user = userEvent.setup();
    render(
      <TasksCalendar
        initialTasks={[
          makeTask({ id: "t1", finishBy: new Date(2026, 7, 1) }),
          makeTask({ id: "t2", finishBy: new Date(2026, 7, 20) }),
        ]}
      />
    );
    await user.click(screen.getByRole("button", { name: "Year" }));

    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("2 tasks")).toBeInTheDocument();
  });

  it("selects a month and lists all tasks due within it", async () => {
    const user = userEvent.setup();
    render(
      <TasksCalendar
        initialTasks={[makeTask({ title: "August task", finishBy: new Date(2026, 7, 20) })]}
      />
    );
    await user.click(screen.getByRole("button", { name: "Year" }));
    await user.click(screen.getByText("August"));

    expect(screen.getByText("Tasks for August 2026")).toBeInTheDocument();
    expect(screen.getByText("August task")).toBeInTheDocument();
  });
});

describe("TasksCalendar — create task gating and flow", () => {
  it("shows the header Create Task button for a logged-in user", () => {
    mockAbility({ accessLevel: "user" });
    render(<TasksCalendar initialTasks={[]} />);

    expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument();
  });

  it("hides the Create Task button when there is no authenticated user", () => {
    mockAbility(null);
    render(<TasksCalendar initialTasks={[]} />);

    expect(screen.queryByRole("button", { name: /create task/i })).not.toBeInTheDocument();
  });

  it("opens the dialog with no prefilled date from the header button", async () => {
    const user = userEvent.setup();
    render(<TasksCalendar initialTasks={[]} />);

    await user.click(screen.getByRole("button", { name: /create task/i }));

    expect(screen.getByText("CreateTaskDialog stub (prefilledDate: null)")).toBeInTheDocument();
  });

  it("opens the dialog with the selected date prefilled from the day panel", async () => {
    const user = userEvent.setup();
    render(<TasksCalendar initialTasks={[]} />);
    await user.click(screen.getByRole("button", { name: "Week" }));
    await user.click(screen.getByText("16"));
    // Selecting a date reveals a second Create Task button, scoped to that day's panel.
    const createButtons = screen.getAllByRole("button", { name: /create task/i });
    await user.click(createButtons[createButtons.length - 1]!);

    expect(screen.getByText("CreateTaskDialog stub (prefilledDate: 2026-7-16)")).toBeInTheDocument();
  });

  it("closes the dialog, refreshes tasks, and refreshes the router on success", async () => {
    const user = userEvent.setup();
    vi.mocked(getTasksAction).mockResolvedValue([makeTask({ title: "New task" })]);
    render(<TasksCalendar initialTasks={[]} />);

    await user.click(screen.getByRole("button", { name: /create task/i }));
    await user.click(screen.getByRole("button", { name: "dialog-success" }));

    expect(screen.queryByText(/CreateTaskDialog stub/)).not.toBeInTheDocument();
    await vi.waitFor(() => expect(getTasksAction).toHaveBeenCalledTimes(1));
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });
});
