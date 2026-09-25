////////////////////////// general error handler
export class ApplicationException extends Error {
  constructor(
    override message: string,
    public statusCode: number,
    override cause?: unknown,
  ) {
    super();
    this.name = this.constructor.name;
    //////// in case stack doesn't return with correct error path
    Error.captureStackTrace(this.constructor);
  }
}
//////////////////////////

export class NotFoundException extends ApplicationException {
  constructor(message: string = "Not found", cause?: unknown) {
    super(message, 404, cause);
  }
}
export class BadRequestException extends ApplicationException {
  constructor(message: string = "Bad request", cause?: unknown) {
    super(message, 400, cause);
  }
}
export class ConflictException extends ApplicationException {
  constructor(message: string = "Conflict", cause?: unknown) {
    super(message, 409, cause);
  }
}
export class internalServerError extends ApplicationException {
  constructor(message: string = "Internal server error", cause?: unknown) {
    super(message, 500, cause);
  }
}
export class UnauthorizedException extends ApplicationException {
  constructor(message: string = "Internal server error", cause?: unknown) {
    super(message, 401, cause);
  }
}
export class ForbiddenException extends ApplicationException {
  constructor(message: string = "Internal server error", cause?: unknown) {
    super(message, 403, cause);
  }
}
