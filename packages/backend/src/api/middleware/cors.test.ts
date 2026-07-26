import { describe, it, expect, afterEach } from "vitest";
import { corsOptions } from "./cors";

const ENV_KEYS = ["APP_DOMAIN", "NODE_ENV", "PLATFORM"] as const;
const originalEnv: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) originalEnv[key] = process.env[key];

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe("corsOptions.origin", () => {
  it("returns APP_DOMAIN when origin is empty", () => {
    process.env.APP_DOMAIN = "https://tasks.example.com";
    expect(corsOptions.origin("")).toBe("https://tasks.example.com");
  });

  it("falls back to localhost:3000 when APP_DOMAIN is unset and origin is empty", () => {
    delete process.env.APP_DOMAIN;
    expect(corsOptions.origin("")).toBe("http://localhost:3000");
  });

  it("allows an origin matching APP_DOMAIN", () => {
    process.env.APP_DOMAIN = "https://tasks.example.com";
    expect(corsOptions.origin("https://tasks.example.com")).toBe("https://tasks.example.com");
  });

  it("allows the hardcoded localhost dev origins", () => {
    expect(corsOptions.origin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(corsOptions.origin("http://localhost:3001")).toBe("http://localhost:3001");
    expect(corsOptions.origin("https://localhost:3000")).toBe("https://localhost:3000");
    expect(corsOptions.origin("https://localhost:3001")).toBe("https://localhost:3001");
  });

  it("rejects an arbitrary origin outside dev mode, falling back to APP_DOMAIN", () => {
    process.env.APP_DOMAIN = "https://tasks.example.com";
    delete process.env.NODE_ENV;
    delete process.env.PLATFORM;
    expect(corsOptions.origin("https://evil.example.com")).toBe("https://tasks.example.com");
  });

  it("allows any localhost port when NODE_ENV=development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.PLATFORM;
    expect(corsOptions.origin("http://localhost:9999")).toBe("http://localhost:9999");
  });

  it("allows any localhost port when PLATFORM=dev", () => {
    delete process.env.NODE_ENV;
    process.env.PLATFORM = "dev";
    expect(corsOptions.origin("https://localhost:5173")).toBe("https://localhost:5173");
  });

  it("does not extend the localhost allowance to non-localhost origins in dev mode", () => {
    process.env.APP_DOMAIN = "https://tasks.example.com";
    process.env.PLATFORM = "dev";
    expect(corsOptions.origin("https://evil.example.com")).toBe("https://tasks.example.com");
  });
});
