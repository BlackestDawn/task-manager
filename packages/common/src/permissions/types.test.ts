import { describe, it, expect } from "vitest";
import { validateUserContext, type UserContext } from "./types";

describe("validateUserContext", () => {
  const validContext: UserContext = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    groups: [],
    accessLevel: "user",
  };

  it("should validate a valid user context", () => {
    const result = validateUserContext(validContext);
    expect(result.id).toBe(validContext.id);
    expect(result.accessLevel).toBe("user");
    expect(result.groups).toEqual([]);
  });

  it("should apply default accessLevel", () => {
    const { accessLevel, ...contextWithoutAccessLevel } = validContext;
    const result = validateUserContext(contextWithoutAccessLevel);
    expect(result.accessLevel).toBe("user");
  });

  it("should apply default groups", () => {
    const { groups, ...contextWithoutGroups } = validContext;
    const result = validateUserContext(contextWithoutGroups);
    expect(result.groups).toEqual([]);
  });

  it("should handle all valid access levels", () => {
    const levels = ["admin", "manager", "user"] as const;
    levels.forEach((level) => {
      const context = { ...validContext, accessLevel: level };
      const result = validateUserContext(context);
      expect(result.accessLevel).toBe(level);
    });
  });

  it("should handle all valid group roles", () => {
    const roles = ["supervisor", "editor", "user", "viewer", "none"] as const;
    roles.forEach((role) => {
      const context = {
        ...validContext,
        groups: [{ id: "223e4567-e89b-12d3-a456-426614174000", role }],
      };
      const result = validateUserContext(context);
      expect(result.groups[0]!.role).toBe(role);
    });
  });

  it("should handle multiple groups", () => {
    const context = {
      ...validContext,
      groups: [
        { id: "223e4567-e89b-12d3-a456-426614174000", role: "editor" as const },
        { id: "323e4567-e89b-12d3-a456-426614174000", role: "viewer" as const },
      ],
    };
    const result = validateUserContext(context);
    expect(result.groups).toHaveLength(2);
  });

  it("should throw error for missing id", () => {
    const { id, ...contextWithoutId } = validContext;
    expect(() => validateUserContext(contextWithoutId)).toThrow(
      "Invalid user context"
    );
  });

  it("should throw error for invalid id UUID", () => {
    const invalidContext = { ...validContext, id: "not-a-uuid" };
    expect(() => validateUserContext(invalidContext)).toThrow(
      "Invalid user context"
    );
  });

  it("should throw error for invalid accessLevel", () => {
    const invalidContext = { ...validContext, accessLevel: "superadmin" };
    expect(() => validateUserContext(invalidContext)).toThrow(
      "Invalid user context"
    );
  });

  it("should throw error for invalid group role", () => {
    const invalidContext = {
      ...validContext,
      groups: [{ id: "223e4567-e89b-12d3-a456-426614174000", role: "owner" }],
    };
    expect(() => validateUserContext(invalidContext)).toThrow(
      "Invalid user context"
    );
  });

  it("should throw error for invalid group id UUID", () => {
    const invalidContext = {
      ...validContext,
      groups: [{ id: "not-a-uuid", role: "user" }],
    };
    expect(() => validateUserContext(invalidContext)).toThrow(
      "Invalid user context"
    );
  });

  it("should throw error for wrong data type", () => {
    expect(() => validateUserContext("not an object")).toThrow(
      "Invalid user context"
    );
    expect(() => validateUserContext(null)).toThrow("Invalid user context");
  });
});
