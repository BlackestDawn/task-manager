import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HamburgerButton from "./hamburgerButton";

describe("HamburgerButton", () => {
  it("shows the menu icon and aria-expanded=false when closed", () => {
    const { container } = render(<HamburgerButton isOpen={false} onClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: /toggle menu/i })).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector(".lucide-menu")).toBeInTheDocument();
    expect(container.querySelector(".lucide-x")).not.toBeInTheDocument();
  });

  it("shows the close icon and aria-expanded=true when open", () => {
    const { container } = render(<HamburgerButton isOpen={true} onClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: /toggle menu/i })).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector(".lucide-x")).toBeInTheDocument();
    expect(container.querySelector(".lucide-menu")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<HamburgerButton isOpen={false} onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /toggle menu/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
