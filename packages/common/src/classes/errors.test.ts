import { describe, it, expect } from "vitest";
import {
  HTTPErrors,
  BadRequestError,
  UserNotAuthenticatedError,
  UserForbiddenError,
  NotFoundError,
  AlreadyExistsConflictError,
} from "./errors";

describe("HTTPErrors", () => {
  it("sets the message and defaults statusCode to 500", () => {
    const error = new HTTPErrors("something broke");
    expect(error.message).toBe("something broke");
    expect(error.statusCode).toBe(500);
  });

  it("is an instance of Error", () => {
    expect(new HTTPErrors("x")).toBeInstanceOf(Error);
  });
});

describe.each([
  ["BadRequestError", BadRequestError, 400],
  ["UserNotAuthenticatedError", UserNotAuthenticatedError, 401],
  ["UserForbiddenError", UserForbiddenError, 403],
  ["NotFoundError", NotFoundError, 404],
  ["AlreadyExistsConflictError", AlreadyExistsConflictError, 409],
] as const)("%s", (name, ErrorClass, expectedStatus) => {
  it(`sets statusCode to ${expectedStatus}`, () => {
    const error = new ErrorClass("boom");
    expect(error.statusCode).toBe(expectedStatus);
  });

  it("preserves the message", () => {
    const error = new ErrorClass("boom");
    expect(error.message).toBe("boom");
  });

  it("is an instance of HTTPErrors and Error", () => {
    const error = new ErrorClass("boom");
    expect(error).toBeInstanceOf(HTTPErrors);
    expect(error).toBeInstanceOf(Error);
  });

  it(`constructs an instance of ${name}`, () => {
    const error = new ErrorClass("boom");
    expect(error.constructor.name).toBe(name);
  });
});
