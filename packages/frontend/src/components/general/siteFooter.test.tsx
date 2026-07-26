import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteFooter from "./siteFooter";

describe("SiteFooter", () => {
  it("shows the current year in the copyright notice", () => {
    render(<SiteFooter />);
    const year = new Date().getUTCFullYear();
    expect(screen.getByText(new RegExp(`© ${year} Alexander Stauch`))).toBeInTheDocument();
  });

  it("links to the cookie policy and licensing pages", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute("href", "/cookie-policy");
    expect(screen.getAllByRole("link", { name: /licensing|creative commons/i })[0]).toHaveAttribute("href", "/licensing");
  });
});
