/**
 * Structured error types. docs/08-API/05-Error-Handling.md
 * Never expose raw database errors or stack traces to the UI.
 */
export class AppError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found.`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class PersistenceError extends AppError {
  constructor(message: string) {
    super(message, 'PERSISTENCE_ERROR');
    this.name = 'PersistenceError';
  }
}

/** Converts unknown thrown values into a user-safe message, never leaking internals. */
export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return 'Something went wrong. Please try again.';
}
