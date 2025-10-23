import { describe, it, expect } from "vitest";
import {
  validateDoByUUIDRequest,
  type DoByUUIDRequest,
} from "./general";
import { BadRequestError } from "../classes/errors";

describe("validateDoByUUIDRequest", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  describe("with object input", () => {
    it("should validate a valid UUID object", () => {
      const validRequest: DoByUUIDRequest = { id: validUUID };
      const result = validateDoByUUIDRequest(validRequest);
      expect(result.id).toBe(validUUID);
    });

    it("should throw BadRequestError for invalid UUID in object", () => {
      const invalidRequest = { id: "not-a-uuid" };
      expect(() => validateDoByUUIDRequest(invalidRequest)).toThrow(
        BadRequestError
      );
      expect(() => validateDoByUUIDRequest(invalidRequest)).toThrow(
        "Invalid/malformed UUID"
      );
    });

    it("should throw BadRequestError for missing id field", () => {
      const emptyRequest = {};
      expect(() => validateDoByUUIDRequest(emptyRequest)).toThrow(
        BadRequestError
      );
    });

    it("should throw BadRequestError for empty UUID string in object", () => {
      const emptyRequest = { id: "" };
      expect(() => validateDoByUUIDRequest(emptyRequest)).toThrow(
        BadRequestError
      );
    });

    it("should throw BadRequestError for null id", () => {
      const nullRequest = { id: null };
      expect(() => validateDoByUUIDRequest(nullRequest)).toThrow(
        BadRequestError
      );
    });

    it("should throw BadRequestError for undefined id", () => {
      const undefinedRequest = { id: undefined };
      expect(() => validateDoByUUIDRequest(undefinedRequest)).toThrow(
        BadRequestError
      );
    });
  });

  describe("with string input", () => {
    it("should convert valid UUID string to object", () => {
      const result = validateDoByUUIDRequest(validUUID);
      expect(result.id).toBe(validUUID);
      expect(result).toHaveProperty("id");
    });

    it("should throw BadRequestError for invalid UUID string", () => {
      expect(() => validateDoByUUIDRequest("not-a-uuid")).toThrow(
        BadRequestError
      );
      expect(() => validateDoByUUIDRequest("not-a-uuid")).toThrow(
        "Invalid/malformed UUID"
      );
    });

    it("should throw BadRequestError for empty string", () => {
      expect(() => validateDoByUUIDRequest("")).toThrow(BadRequestError);
    });

    it("should handle UUID string with uppercase letters", () => {
      const uppercaseUUID = "123E4567-E89B-12D3-A456-426614174000";
      const result = validateDoByUUIDRequest(uppercaseUUID);
      expect(result.id).toBe(uppercaseUUID.toLowerCase());
    });

    it("should handle UUID string with mixed case", () => {
      const mixedCaseUUID = "123e4567-E89B-12d3-A456-426614174000";
      const result = validateDoByUUIDRequest(mixedCaseUUID);
      expect(result.id).toBeDefined();
    });
  });

  describe("with invalid input types", () => {
    it("should throw BadRequestError for number input", () => {
      expect(() => validateDoByUUIDRequest(12345 as any)).toThrow(
        BadRequestError
      );
    });

    it("should throw BadRequestError for boolean input", () => {
      expect(() => validateDoByUUIDRequest(true as any)).toThrow(
        BadRequestError
      );
    });

    it("should throw BadRequestError for array input", () => {
      expect(() => validateDoByUUIDRequest([validUUID] as any)).toThrow(
        BadRequestError
      );
    });

    it("should throw BadRequestError for null input", () => {
      expect(() => validateDoByUUIDRequest(null as any)).toThrow(
        BadRequestError
      );
    });

    it("should throw BadRequestError for undefined input", () => {
      expect(() => validateDoByUUIDRequest(undefined as any)).toThrow(
        BadRequestError
      );
    });
  });

  describe("edge cases", () => {
    it("should handle UUID with hyphens in correct positions", () => {
      const uuidWithHyphens = "550e8400-e29b-41d4-a716-446655440000";
      const result = validateDoByUUIDRequest(uuidWithHyphens);
      expect(result.id).toBe(uuidWithHyphens);
    });

    it("should reject UUID-like string with wrong format", () => {
      const wrongFormat = "550e8400e29b41d4a716446655440000"; // missing hyphens
      expect(() => validateDoByUUIDRequest(wrongFormat)).toThrow(
        BadRequestError
      );
    });

    it("should reject UUID with extra characters", () => {
      const extraChars = "123e4567-e89b-12d3-a456-426614174000-extra";
      expect(() => validateDoByUUIDRequest(extraChars)).toThrow(
        BadRequestError
      );
    });

    it("should reject UUID with spaces", () => {
      const withSpaces = "123e4567 e89b 12d3 a456 426614174000";
      expect(() => validateDoByUUIDRequest(withSpaces)).toThrow(
        BadRequestError
      );
    });

    it("should reject too short UUID", () => {
      const tooShort = "123e4567-e89b";
      expect(() => validateDoByUUIDRequest(tooShort)).toThrow(BadRequestError);
    });

    it("should reject UUID with invalid characters", () => {
      const invalidChars = "123g4567-e89b-12d3-a456-426614174000";
      expect(() => validateDoByUUIDRequest(invalidChars)).toThrow(
        BadRequestError
      );
    });

    it("should handle UUID v1 format", () => {
      const uuidV1 = "d3aa88e2-c754-11e9-a32f-2a2ae2dbcce4";
      const result = validateDoByUUIDRequest(uuidV1);
      expect(result.id).toBe(uuidV1);
    });

    it("should handle UUID v4 format", () => {
      const uuidV4 = "a3bb189e-8bf9-3888-9912-ace4e6543002";
      const result = validateDoByUUIDRequest(uuidV4);
      expect(result.id).toBe(uuidV4);
    });

    it("should handle nil UUID (all zeros)", () => {
      const nilUUID = "00000000-0000-0000-0000-000000000000";
      const result = validateDoByUUIDRequest(nilUUID);
      expect(result.id).toBe(nilUUID);
    });
  });

  describe("object with additional properties", () => {
    it("should extract id and ignore extra properties", () => {
      const requestWithExtra = {
        id: validUUID,
        name: "test",
        value: 123,
      };
      const result = validateDoByUUIDRequest(requestWithExtra);
      expect(result.id).toBe(validUUID);
      expect((result as any).name).toBeUndefined();
      expect((result as any).value).toBeUndefined();
    });
  });
});
