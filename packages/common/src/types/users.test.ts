import { describe, it, expect } from "vitest";
import {
  validateUser,
  validateUserArray,
  validateCreateUserRequest,
  validateUpdateUserRequest,
  validateUpdatePasswordRequest,
  validateUpdateUserDisabledRequest,
  type User,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "./users";

describe("validateUser", () => {
  const validUser = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    login: "testuser",
    name: "Test User",
    email: "test@example.com",
    disabled: false,
    accessLevel: "user" as const,
    groups: [],
  };

  it("should validate a valid user object", () => {
    const result = validateUser(validUser);
    expect(result).toBeDefined();
    expect(result.id).toBe(validUser.id);
    expect(result.login).toBe(validUser.login);
    expect(result.name).toBe(validUser.name);
  });

  it("should add default __typename", () => {
    const result = validateUser(validUser);
    expect(result.__typename).toBe("User");
  });

  it("should handle user with groups", () => {
    const userWithGroups = {
      ...validUser,
      groups: [
        { id: "223e4567-e89b-12d3-a456-426614174000", role: "user" as const },
        { id: "323e4567-e89b-12d3-a456-426614174000", role: "editor" as const },
      ],
    };
    const result = validateUser(userWithGroups);
    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]!.role).toBe("user");
  });

  it("should handle null email", () => {
    const userWithNullEmail = { ...validUser, email: null };
    const result = validateUser(userWithNullEmail);
    expect(result.email).toBeNull();
  });

  it("should handle undefined email and default to null", () => {
    const { email, ...userWithoutEmail } = validUser;
    const result = validateUser(userWithoutEmail);
    expect(result.email).toBeNull();
  });

  it("should handle all access levels", () => {
    const accessLevels = ["admin", "manager", "user"] as const;
    accessLevels.forEach((level) => {
      const user = { ...validUser, accessLevel: level };
      const result = validateUser(user);
      expect(result.accessLevel).toBe(level);
    });
  });

  it("should handle all group roles", () => {
    const roles = ["supervisor", "editor", "user", "viewer", "none"] as const;
    roles.forEach((role) => {
      const user = {
        ...validUser,
        groups: [{ id: "223e4567-e89b-12d3-a456-426614174000", role }],
      };
      const result = validateUser(user);
      expect(result.groups[0]!.role).toBe(role);
    });
  });

  it("should coerce string dates to Date objects", () => {
    const userWithStringDates = {
      ...validUser,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    };
    const result = validateUser(userWithStringDates);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("should apply default values", () => {
    const minimalUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      createdAt: new Date(),
      updatedAt: new Date(),
      login: "testuser",
      name: "Test User",
    };
    const result = validateUser(minimalUser);
    expect(result.disabled).toBe(false);
    expect(result.accessLevel).toBe("user");
    expect(result.groups).toEqual([]);
    expect(result.email).toBeNull();
  });

  it("should throw error for invalid UUID", () => {
    const invalidUser = { ...validUser, id: "not-a-uuid" };
    expect(() => validateUser(invalidUser)).toThrow("Invalid user");
  });

  it("should throw error for missing required field", () => {
    const { login, ...userWithoutLogin } = validUser;
    expect(() => validateUser(userWithoutLogin)).toThrow("Invalid user");
  });

  it("should throw error for invalid access level", () => {
    const invalidUser = { ...validUser, accessLevel: "superuser" };
    expect(() => validateUser(invalidUser)).toThrow("Invalid user");
  });

  it("should throw error for invalid group role", () => {
    const invalidUser = {
      ...validUser,
      groups: [{ id: "223e4567-e89b-12d3-a456-426614174000", role: "owner" }],
    };
    expect(() => validateUser(invalidUser)).toThrow("Invalid user");
  });

  it("should throw error for invalid group UUID", () => {
    const invalidUser = {
      ...validUser,
      groups: [{ id: "not-a-uuid", role: "user" }],
    };
    expect(() => validateUser(invalidUser)).toThrow("Invalid user");
  });

  it("should throw error for wrong data type", () => {
    expect(() => validateUser("not an object")).toThrow("Invalid user");
    expect(() => validateUser(123)).toThrow("Invalid user");
    expect(() => validateUser(null)).toThrow("Invalid user");
  });
});

describe("validateUserArray", () => {
  const validUser1 = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "user1",
    name: "User One",
    email: "user1@example.com",
    disabled: false,
    accessLevel: "user" as const,
    groups: [],
  };

  const validUser2 = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "user2",
    name: "User Two",
    email: null,
    disabled: true,
    accessLevel: "admin" as const,
    groups: [],
  };

  it("should validate an array of valid users", () => {
    const result = validateUserArray([validUser1, validUser2]);
    expect(result).toHaveLength(2);
    expect(result[0]!.login).toBe("user1");
    expect(result[1]!.login).toBe("user2");
  });

  it("should validate an empty array", () => {
    const result = validateUserArray([]);
    expect(result).toEqual([]);
  });

  it("should throw error if one user is invalid", () => {
    const invalidUsers = [validUser1, { ...validUser2, id: "not-a-uuid" }];
    expect(() => validateUserArray(invalidUsers)).toThrow("Invalid users");
  });

  it("should throw error for non-array input", () => {
    expect(() => validateUserArray(validUser1 as any)).toThrow("Invalid users");
  });
});

describe("validateCreateUserRequest", () => {
  const validRequest: CreateUserRequest = {
    login: "newuser",
    password: "securepassword123",
    name: "New User",
    email: "new@example.com",
    accessLevel: "user",
  };

  it("should validate a valid create user request", () => {
    const result = validateCreateUserRequest(validRequest);
    expect(result.login).toBe(validRequest.login);
    expect(result.password).toBe(validRequest.password);
    expect(result.name).toBe(validRequest.name);
    expect(result.email).toBe(validRequest.email);
  });

  it("should handle null email", () => {
    const requestWithNullEmail = { ...validRequest, email: null };
    const result = validateCreateUserRequest(requestWithNullEmail);
    expect(result.email).toBeNull();
  });

  it("should handle undefined email and default to null", () => {
    const { email, ...requestWithoutEmail } = validRequest;
    const result = validateCreateUserRequest(requestWithoutEmail);
    expect(result.email).toBeNull();
  });

  it("should apply default access level", () => {
    const { accessLevel, ...requestWithoutAccessLevel } = validRequest;
    const result = validateCreateUserRequest(requestWithoutAccessLevel);
    expect(result.accessLevel).toBe("user");
  });

  it("should handle all valid access levels", () => {
    const levels = ["admin", "manager", "user"] as const;
    levels.forEach((level) => {
      const request = { ...validRequest, accessLevel: level };
      const result = validateCreateUserRequest(request);
      expect(result.accessLevel).toBe(level);
    });
  });

  it("should throw error for missing login", () => {
    const { login, ...requestWithoutLogin } = validRequest;
    expect(() => validateCreateUserRequest(requestWithoutLogin)).toThrow(
      "Invalid create user request"
    );
  });

  it("should throw error for missing password", () => {
    const { password, ...requestWithoutPassword } = validRequest;
    expect(() => validateCreateUserRequest(requestWithoutPassword)).toThrow(
      "Invalid create user request"
    );
  });

  it("should throw error for missing name", () => {
    const { name, ...requestWithoutName } = validRequest;
    expect(() => validateCreateUserRequest(requestWithoutName)).toThrow(
      "Invalid create user request"
    );
  });

  it("should throw error for invalid access level", () => {
    const invalidRequest = { ...validRequest, accessLevel: "superadmin" };
    expect(() => validateCreateUserRequest(invalidRequest)).toThrow(
      "Invalid create user request"
    );
  });

  it("should throw error for empty strings", () => {
    expect(() =>
      validateCreateUserRequest({ ...validRequest, login: "" })
    ).toThrow("Invalid create user request");
    expect(() =>
      validateCreateUserRequest({ ...validRequest, password: "" })
    ).toThrow("Invalid create user request");
    expect(() =>
      validateCreateUserRequest({ ...validRequest, name: "" })
    ).toThrow("Invalid create user request");
  });
});

describe("validateUpdateUserRequest", () => {
  const validRequest: UpdateUserRequest = {
    login: "updateduser",
    name: "Updated Name",
    email: "updated@example.com",
    accessLevel: "manager",
  };

  it("should validate a valid update user request", () => {
    const result = validateUpdateUserRequest(validRequest);
    expect(result.login).toBe(validRequest.login);
    expect(result.name).toBe(validRequest.name);
    expect(result.email).toBe(validRequest.email);
    expect(result.accessLevel).toBe(validRequest.accessLevel);
  });

  it("should handle null email", () => {
    const requestWithNullEmail = { ...validRequest, email: null };
    const result = validateUpdateUserRequest(requestWithNullEmail);
    expect(result.email).toBeNull();
  });

  it("should handle undefined email and default to null", () => {
    const { email, ...requestWithoutEmail } = validRequest;
    const result = validateUpdateUserRequest(requestWithoutEmail);
    expect(result.email).toBeNull();
  });

  it("should apply default access level", () => {
    const { accessLevel, ...requestWithoutAccessLevel } = validRequest;
    const result = validateUpdateUserRequest(requestWithoutAccessLevel);
    expect(result.accessLevel).toBe("user");
  });

  it("should handle all valid access levels", () => {
    const levels = ["admin", "manager", "user"] as const;
    levels.forEach((level) => {
      const request = { ...validRequest, accessLevel: level };
      const result = validateUpdateUserRequest(request);
      expect(result.accessLevel).toBe(level);
    });
  });

  it("should throw error for missing login", () => {
    const { login, ...requestWithoutLogin } = validRequest;
    expect(() => validateUpdateUserRequest(requestWithoutLogin)).toThrow(
      "Invalid update user request"
    );
  });

  it("should throw error for missing name", () => {
    const { name, ...requestWithoutName } = validRequest;
    expect(() => validateUpdateUserRequest(requestWithoutName)).toThrow(
      "Invalid update user request"
    );
  });

  it("should throw error for invalid access level", () => {
    const invalidRequest = { ...validRequest, accessLevel: "guest" };
    expect(() => validateUpdateUserRequest(invalidRequest)).toThrow(
      "Invalid update user request"
    );
  });
});

describe("validateUpdatePasswordRequest", () => {
  it("should validate a valid password update request", () => {
    const request = { password: "newSecurePassword123" };
    const result = validateUpdatePasswordRequest(request);
    expect(result.password).toBe(request.password);
  });

  it("should throw error for missing password", () => {
    expect(() => validateUpdatePasswordRequest({})).toThrow(
      "Invalid update password request"
    );
  });

  it("should throw error for empty password", () => {
    expect(() => validateUpdatePasswordRequest({ password: "" })).toThrow(
      "Invalid update password request"
    );
  });

  it("should accept very long passwords", () => {
    const longPassword = "a".repeat(1000);
    const result = validateUpdatePasswordRequest({ password: longPassword });
    expect(result.password).toBe(longPassword);
  });

  it("should accept passwords with special characters", () => {
    const specialPassword = "p@$$w0rd!#$%^&*()";
    const result = validateUpdatePasswordRequest({ password: specialPassword });
    expect(result.password).toBe(specialPassword);
  });
});

describe("validateUpdateUserDisabledRequest", () => {
  it("should validate request to disable user", () => {
    const request = { disabled: true };
    const result = validateUpdateUserDisabledRequest(request);
    expect(result.disabled).toBe(true);
  });

  it("should validate request to enable user", () => {
    const request = { disabled: false };
    const result = validateUpdateUserDisabledRequest(request);
    expect(result.disabled).toBe(false);
  });

  it("should throw error for missing disabled field", () => {
    expect(() => validateUpdateUserDisabledRequest({})).toThrow(
      "Invalid update user disabled request"
    );
  });

  it("should throw error for non-boolean disabled field", () => {
    expect(() =>
      validateUpdateUserDisabledRequest({ disabled: "true" })
    ).toThrow("Invalid update user disabled request");
    expect(() => validateUpdateUserDisabledRequest({ disabled: 1 })).toThrow(
      "Invalid update user disabled request"
    );
  });
});
