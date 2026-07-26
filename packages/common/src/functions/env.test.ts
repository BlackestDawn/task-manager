import { describe, it, expect, afterEach } from "vitest";
import { envOrThrow, envOrDefault } from "./env";

const KEY = "COMMON_ENV_TEST_VAR";

describe("envOrThrow", () => {
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[KEY];
    } else {
      process.env[KEY] = original;
    }
  });

  it("returns the value when the env var is set", () => {
    process.env[KEY] = "hello";
    expect(envOrThrow(KEY)).toBe("hello");
  });

  it("throws when the env var is not set", () => {
    delete process.env[KEY];
    expect(() => envOrThrow(KEY)).toThrow(`${KEY} must be set`);
  });

  it("throws when the env var is an empty string", () => {
    process.env[KEY] = "";
    expect(() => envOrThrow(KEY)).toThrow(`${KEY} must be set`);
  });
});

describe("envOrDefault", () => {
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[KEY];
    } else {
      process.env[KEY] = original;
    }
  });

  it("returns the value when the env var is set", () => {
    process.env[KEY] = "hello";
    expect(envOrDefault(KEY, "fallback")).toBe("hello");
  });

  it("returns the default when the env var is not set", () => {
    delete process.env[KEY];
    expect(envOrDefault(KEY, "fallback")).toBe("fallback");
  });

  it("returns the default when the env var is an empty string", () => {
    process.env[KEY] = "";
    expect(envOrDefault(KEY, "fallback")).toBe("fallback");
  });
});
