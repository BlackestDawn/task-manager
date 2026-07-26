import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RedirectNotification from "./redirectNotification";
import { useSearchParams } from "next/navigation";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

function mockSearchParams(params: Record<string, string> = {}) {
  const usp = new URLSearchParams(params);
  vi.mocked(useSearchParams).mockReturnValue(usp as ReturnType<typeof useSearchParams>);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("RedirectNotification", () => {
  it("renders nothing when there is no redirect param", async () => {
    mockSearchParams();

    render(<RedirectNotification />);

    // Give the mount + effect microtasks a turn, then confirm it never appears.
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByText(/authentication required/i)).not.toBeInTheDocument();
  });

  it("becomes visible and names the attempted page when a redirect param is present", async () => {
    mockSearchParams({ redirect: "/tasks/create-important-task" });

    render(<RedirectNotification />);

    expect(await screen.findByText(/authentication required/i)).toBeInTheDocument();
    expect(screen.getByText("Create Important Task")).toBeInTheDocument();
  });

  it("names the homepage when the redirect path has no segments", async () => {
    mockSearchParams({ redirect: "/" });

    render(<RedirectNotification />);

    expect(await screen.findByText("homepage")).toBeInTheDocument();
  });

  it("auto-hides after 5 seconds", async () => {
    // Fake timers must be active before the component's setTimeout(5000) is
    // scheduled — switching to fake timers afterward wouldn't affect a
    // timer already registered with the real one. shouldAdvanceTime keeps
    // findByText's real-time polling working alongside it.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockSearchParams({ redirect: "/tasks" });
    render(<RedirectNotification />);

    expect(await screen.findByText(/authentication required/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(screen.queryByText(/authentication required/i)).not.toBeInTheDocument();
  });

  it("closes immediately when the close button is clicked", async () => {
    const user = userEvent.setup();
    mockSearchParams({ redirect: "/tasks" });

    render(<RedirectNotification />);

    expect(await screen.findByText(/authentication required/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /close notification/i }));

    await waitFor(() => {
      expect(screen.queryByText(/authentication required/i)).not.toBeInTheDocument();
    });
  });
});
