export class CdiUnauthorizedError extends Error {
  constructor(message = "A Decionis session is required") {
    super(message);
    this.name = "CdiUnauthorizedError";
  }
}

export class CdiForbiddenError extends Error {
  constructor(message = "The current role cannot perform this action") {
    super(message);
    this.name = "CdiForbiddenError";
  }
}

export class CdiGatewayError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "CdiGatewayError";
    this.status = status;
    this.body = body;
  }
}

export class CdiNotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} was not found`);
    this.name = "CdiNotFoundError";
  }
}
