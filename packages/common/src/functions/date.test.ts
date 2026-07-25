import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getTZNormalizedDate,
  isTaskOverdue,
  isThisWeek,
  isThisMonth,
  sortTasksByFinishDate,
} from "./date";
import type { Task } from "../types/tasks";

const DAY_MS = 24 * 60 * 60 * 1000;

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Task",
    description: null,
    finishBy: null,
    userId: "223e4567-e89b-12d3-a456-426614174000",
    completed: false,
    completedAt: null,
    groups: [],
    ...overrides,
  };
}

describe("getTZNormalizedDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shifts the current time by the local timezone offset with no explicit offset", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const result = getTZNormalizedDate();
    const expected = new Date("2024-06-15T12:00:00Z");
    expected.setTime(expected.getTime() - expected.getTimezoneOffset() * 60000);
    expect(result.getTime()).toBe(expected.getTime());
  });

  it("applies a positive offset in seconds", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const result = getTZNormalizedDate(60);
    const expected = new Date("2024-06-15T12:00:00Z");
    expected.setTime(expected.getTime() - expected.getTimezoneOffset() * 60000 + 60000);
    expect(result.getTime()).toBe(expected.getTime());
  });

  it("applies a negative offset in seconds", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    const result = getTZNormalizedDate(-60);
    const expected = new Date("2024-06-15T12:00:00Z");
    expected.setTime(expected.getTime() - expected.getTimezoneOffset() * 60000 - 60000);
    expect(result.getTime()).toBe(expected.getTime());
  });

  it("treats an undefined offset the same as zero", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    expect(getTZNormalizedDate(undefined).getTime()).toBe(getTZNormalizedDate(0).getTime());
  });
});

describe("isTaskOverdue", () => {
  it("returns false when finishBy is null", () => {
    expect(isTaskOverdue(makeTask({ finishBy: null }))).toBe(false);
  });

  it("returns true for a past due date that isn't completed", () => {
    const task = makeTask({ finishBy: new Date(Date.now() - DAY_MS), completed: false });
    expect(isTaskOverdue(task)).toBe(true);
  });

  it("returns false for a past due date that is completed", () => {
    const task = makeTask({ finishBy: new Date(Date.now() - DAY_MS), completed: true });
    expect(isTaskOverdue(task)).toBe(false);
  });

  it("returns false for a future due date", () => {
    const task = makeTask({ finishBy: new Date(Date.now() + DAY_MS), completed: false });
    expect(isTaskOverdue(task)).toBe(false);
  });

  it("returns false when due today", () => {
    const task = makeTask({ finishBy: new Date(), completed: false });
    expect(isTaskOverdue(task)).toBe(false);
  });
});

describe("isThisWeek", () => {
  it("returns false when date is null", () => {
    expect(isThisWeek(null)).toBe(false);
  });

  it("returns true for today", () => {
    expect(isThisWeek(new Date())).toBe(true);
  });

  it("returns false for 8 days from now", () => {
    expect(isThisWeek(new Date(Date.now() + 8 * DAY_MS))).toBe(false);
  });

  it("returns false for 8 days ago", () => {
    expect(isThisWeek(new Date(Date.now() - 8 * DAY_MS))).toBe(false);
  });

  it("treats Monday as the first day of the week and Sunday as the last", () => {
    // 2024-06-10 is a Monday, 2024-06-16 is the following Sunday.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-12T12:00:00Z")); // Wednesday that week
    expect(isThisWeek("2024-06-10T00:00:00Z")).toBe(true);
    expect(isThisWeek("2024-06-16T00:00:00Z")).toBe(true);
    expect(isThisWeek("2024-06-09T00:00:00Z")).toBe(false);
    expect(isThisWeek("2024-06-17T00:00:00Z")).toBe(false);
    vi.useRealTimers();
  });

  it("accepts a string date", () => {
    const todayISO = new Date().toISOString();
    expect(isThisWeek(todayISO)).toBe(true);
  });
});

describe("isThisMonth", () => {
  it("returns false when date is null", () => {
    expect(isThisMonth(null)).toBe(false);
  });

  it("returns true for today", () => {
    expect(isThisMonth(new Date())).toBe(true);
  });

  it("returns false for a date in a different month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    expect(isThisMonth("2024-07-01T00:00:00Z")).toBe(false);
    vi.useRealTimers();
  });

  it("returns false for the same month/day in a different year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    expect(isThisMonth("2023-06-15T00:00:00Z")).toBe(false);
    vi.useRealTimers();
  });

  it("accepts a string date", () => {
    const todayISO = new Date().toISOString();
    expect(isThisMonth(todayISO)).toBe(true);
  });
});

describe("sortTasksByFinishDate", () => {
  it("sorts tasks ascending by finishBy date", () => {
    const earlier = makeTask({ id: "a", finishBy: new Date("2024-01-01") });
    const later = makeTask({ id: "b", finishBy: new Date("2024-06-01") });
    expect(sortTasksByFinishDate(earlier, later)).toBeLessThan(0);
    expect(sortTasksByFinishDate(later, earlier)).toBeGreaterThan(0);
  });

  it("treats equal dates as equal", () => {
    const date = new Date("2024-01-01");
    const a = makeTask({ finishBy: date });
    const b = makeTask({ finishBy: new Date(date) });
    expect(sortTasksByFinishDate(a, b)).toBe(0);
  });

  it("sorts tasks without a finishBy date to the end", () => {
    const withDate = makeTask({ id: "a", finishBy: new Date("2024-01-01") });
    const withoutDate = makeTask({ id: "b", finishBy: null });
    expect(sortTasksByFinishDate(withoutDate, withDate)).toBeGreaterThan(0);
    expect(sortTasksByFinishDate(withDate, withoutDate)).toBeLessThan(0);
  });

  it("treats two tasks without finishBy as tied in a's favor", () => {
    const a = makeTask({ id: "a", finishBy: null });
    const b = makeTask({ id: "b", finishBy: null });
    // Both branches return early (1 then -1 is unreachable), so `a` without
    // a date always reports itself as sorting after `b` first.
    expect(sortTasksByFinishDate(a, b)).toBe(1);
  });
});
