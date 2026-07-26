import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMounted } from "./useMounted";

describe("useMounted", () => {
  it("returns true once rendered on the client", () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });
});
