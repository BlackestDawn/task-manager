export class HTTPErrors extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 500;
  }
}

export class BadRequestError extends HTTPErrors {
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

export class UserNotAuthenticatedError extends HTTPErrors {
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

export class UserForbiddenError extends HTTPErrors {
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
  }
}

export class NotFoundError extends HTTPErrors {
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}

export class AlreadyExistsConflictError extends HTTPErrors {
  constructor(message: string) {
    super(message);
    this.statusCode = 409;
  }
}
