export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = 'INVALID_CREDENTIALS') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class LockedError extends AppError {
  constructor(message: string, code = 'ACCOUNT_LOCKED') {
    super(message, 423, code);
  }
}

/**
 * For write operations intentionally left unimplemented because the live DB has no backing
 * stored procedure and the real numbering/computation/posting business rules aren't known
 * (see docs/README known gaps) - surfaces a clear message instead of a raw SQL error.
 */
export class NotImplementedError extends AppError {
  constructor(message: string, code = 'NOT_IMPLEMENTED') {
    super(message, 501, code);
  }
}
