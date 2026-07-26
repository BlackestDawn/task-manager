import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LayoutVerification from "./layoutVerification";

let injectedScript: HTMLScriptElement | null = null;

function setNodeEnv(env: string) {
  vi.stubEnv("NODE_ENV", env);
}

function injectAuthScript() {
  injectedScript = document.createElement("script");
  injectedScript.innerHTML = "window.__INITIAL_AUTH_STATE__ = {};";
  document.body.appendChild(injectedScript);
}

beforeEach(() => {
  delete window.__INITIAL_AUTH_STATE__;
});

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.__INITIAL_AUTH_STATE__;
  if (injectedScript) {
    injectedScript.remove();
    injectedScript = null;
  }
});

describe("LayoutVerification", () => {
  it("renders nothing outside of development", () => {
    setNodeEnv("production");
    const { container } = render(<LayoutVerification />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a FAIL status in development when the auth script and initial state are missing", async () => {
    setNodeEnv("development");
    render(<LayoutVerification />);

    expect(await screen.findByText("✗ FAIL")).toBeInTheDocument();
    expect(screen.getByText(/ServerAuthProvider is NOT rendering/)).toBeInTheDocument();
  });

  it("shows a PASS status in development when the auth script and initial state are both present", async () => {
    setNodeEnv("development");
    window.__INITIAL_AUTH_STATE__ = { user: null, isAuthenticated: false };
    injectAuthScript();

    render(<LayoutVerification />);

    expect(await screen.findByText("✓ PASS")).toBeInTheDocument();
    expect(screen.getByText(/Both ServerAuthProvider and ClientAuthProvider are properly set up/)).toBeInTheDocument();
  });
});
