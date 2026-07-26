import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteHeader from "./siteHeader";
import { checkAuthAction } from "@/lib/actions/auth";

vi.mock("@/lib/actions/auth", () => ({
  checkAuthAction: vi.fn(),
}));

// HeaderComponent has its own dedicated test suite — stub it here so this
// file only exercises SiteHeader's own job: fetching auth state and passing
// it down.
vi.mock("./headerComponent", () => ({
  default: ({ isAuthenticated }: { isAuthenticated: boolean }) => (
    <p>HeaderComponent stub (isAuthenticated: {String(isAuthenticated)})</p>
  ),
}));

describe("SiteHeader", () => {
  it("passes isAuthenticated=true through to HeaderComponent", async () => {
    vi.mocked(checkAuthAction).mockResolvedValue({ isAuthenticated: true, user: null });

    render(await SiteHeader());

    expect(screen.getByText("HeaderComponent stub (isAuthenticated: true)")).toBeInTheDocument();
  });

  it("passes isAuthenticated=false through to HeaderComponent", async () => {
    vi.mocked(checkAuthAction).mockResolvedValue({ isAuthenticated: false, user: null });

    render(await SiteHeader());

    expect(screen.getByText("HeaderComponent stub (isAuthenticated: false)")).toBeInTheDocument();
  });
});
