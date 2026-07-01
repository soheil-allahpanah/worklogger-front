export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly details?: string[],
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "You must be logged in") {
    super(message, "UNAUTHENTICATED");
    this.name = "UnauthenticatedError";
  }
}

export class InputParseError extends AppError {
  constructor(message: string, details?: string[]) {
    super(message, "INPUT_PARSE", details);
    this.name = "InputParseError";
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    readonly status: number,
    details?: string[],
  ) {
    super(message, "API_ERROR", details);
    this.name = "ApiError";
  }
}
