import { Response } from "express";

import { 
  BadRequestMsgResponse,
  BadRequestResponse,
  ForbiddenResponse,
  InternalResponse,
  NotFoundResponse,
  UnauthorizedResponse
} from "./ApiResponse";

/**
 * ============================================================================
 * ApiError — Typed Error Hierarchy + HTTP Response Mapping
 * ============================================================================
 *
 * Companion to `./ApiResponse`. Controllers and services signal failures by
 * THROWING one of the classes below; they never format an error response
 * themselves. The centralized Express error middleware (`errorHander.ts`)
 * catches the error, checks `instanceof ApiError`, and delegates to
 * `err.handle(err, res)`, which maps the error's `ErrorType` to the matching
 * ApiResponse class:
 *
 *   @example
 *   // inside a controller / service:
 *   throw new NotFoundError("User does not exist.");
 *   throw new BadRequestError("Validation failed.", { email: "invalid" });
 *
 *   // inside errorHander.ts:
 *   if (err instanceof ApiError) return err.handle(err, res);
 *
 * Every concrete error subclass:
 *   - takes an OPTIONAL message and falls back to a default from
 *     `ErrorMessage` when none is given, and
 *   - carries an `ErrorType` tag that decides the HTTP status via `handle()`.
 *
 * The two files form the full contract of this core:
 *   ApiResponse classes  -> what gets sent on success
 *   ApiError classes     -> what gets thrown on failure (converted to an
 *                           ApiResponse by `handle()`)
 *
 * NOTE for copy-paste use: this file depends only on Express (the `Response`
 * type) and on `./ApiResponse`. Drop both into any Express + TypeScript
 * project as-is.
 * ============================================================================
 */

/**
 * Machine-readable category tags for every error the API can throw.
 * `handle()` switches on these to pick the HTTP response class.
 *
 * NOTE: `INVALID_TOKEN` is defined (and handled) but the `InvalidTokenError`
 * class actually tags itself `UNAUTHORIZED` — kept for future use / back-compat.
 */
export enum ErrorType {
  INVALID_TOKEN = "InvalidTokenError", 
  TOKEN_EXPIRED = "TokenExpiredError",
  UNAUTHORIZED = "AuthFailureError", 
  ACCESS_TOKEN = "AccessTokenError",
  NOT_FOUND = "NotFoundError",
  NO_ENTRY = "NoEntryError",
  NO_DATA = "NoDataError",
  BAD_REQUEST = "BadRequestError",
  BAD_REQUEST_MSG = "BadRequestMsgError",
  FORBIDDEN = "ForbiddenError",
  INTERNAL = "InternalError",
}

/**
 * Default, client-safe message for each error type.
 * Used whenever a concrete error is constructed without an explicit message
 * (see the `message || ErrorMessage.X` pattern in the subclasses below).
 */
export enum ErrorMessage {
  INVALID_TOKEN = "Invalid token.",
  TOKEN_EXPIRED = "Your token has expired. Please request a new one.",
  UNAUTHORIZED = "You are unauthorized to access this resource.",
  ACCESS_TOKEN = "Invalid access token.",
  NOT_FOUND = "The requested resource could not be found.",
  NO_ENTRY = "Please provide your entry.",
  NO_DATA = "No data available for this request.",
  BAD_REQUEST = "Bad request. Please check your payload.",
  BAD_REQUEST_MSG = "Invalid payload or parameters provided.",
  FORBIDDEN = "You do not have permission to perform this action.",
  INTERNAL = "An internal server error occurred.",
}

/**
 * Base class for every API error.
 *
 * Extends the native `Error` so the class plays well with `instanceof`,
 * try/catch and the Express error pipeline.
 *
 */
export class ApiError extends Error {
  /**
   * @param type    ErrorType tag — decides the HTTP status (see `handle()`).
   * @param message Message shown to the client.
   * @param data    Optional extra payload (e.g. field-level validation errors).
   */
  constructor(
    public type: ErrorType,
    public message: string,
    public data?: any,
  ) {
    super(message); 
  }

  /**
   * Converts this error into the matching ApiResponse and sends it.
   *
   * Invoked by the global error middleware (`errorHander.ts`) — controllers
   * and services should never call this directly; they only throw.
   *
   * Type -> response routing table:
   *
   *   UNAUTHORIZED | TOKEN_EXPIRED | ACCESS_TOKEN
   *       -> UnauthorizedResponse (401)
   *   INVALID_TOKEN | BAD_REQUEST_MSG | NO_DATA | NO_ENTRY
   *       -> BadRequestMsgResponse (400)
   *   FORBIDDEN
   *       -> ForbiddenResponse (403)
   *   BAD_REQUEST
   *       -> BadRequestResponse (400, includes `err.data` in the body)
   *   NOT_FOUND
   *       -> NotFoundResponse (404)
   *   INTERNAL
   *       -> InternalResponse (500)
   */
  public handle(err: ApiError, res: Response){
    switch(err.type){
      case ErrorType.UNAUTHORIZED:
      case ErrorType.TOKEN_EXPIRED:
      case ErrorType.ACCESS_TOKEN:
        return new UnauthorizedResponse(err.message).send(res)
      case ErrorType.INVALID_TOKEN:
      case ErrorType.BAD_REQUEST_MSG:
      case ErrorType.NO_DATA:
      case ErrorType.NO_ENTRY:
        return new BadRequestMsgResponse(err.message).send(res)
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(err.message).send(res)
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.message, err.data).send(res)
      case ErrorType.NOT_FOUND:
        return new NotFoundResponse(err.message).send(res)
      case ErrorType.INTERNAL:
        return new InternalResponse(err.message).send(res)
    }
  }
}

/**
 * 401 — the token is missing or malformed.
 *
 * NOTE: internally tagged `UNAUTHORIZED` (not `INVALID_TOKEN`), so it maps to
 * a 401 UnauthorizedResponse. If you construct an `ApiError` directly with
 * `ErrorType.INVALID_TOKEN` instead, it maps to a 400 BadRequestMsgResponse.
 */
export class InvalidTokenError extends ApiError {
  constructor(message?: string){
    super(ErrorType.UNAUTHORIZED, message || ErrorMessage.INVALID_TOKEN)
  }
}

/**
 * 401 — the token has expired.
 * Throw from auth middleware / token verification.
 */
export class TokenExpiredError extends ApiError {
  constructor(message?: string){
    super(ErrorType.TOKEN_EXPIRED, message || ErrorMessage.TOKEN_EXPIRED)
  }
}

/**
 * 401 — the requestor failed authentication.
 * Throw when credentials are missing, invalid, or the user is not logged in.
 */
export class UnauthorizedError extends ApiError {
  constructor(message?: string){
    super(ErrorType.UNAUTHORIZED, message || ErrorMessage.UNAUTHORIZED)
  }
}

/**
 * 404 — the requested resource does not exist.
 * Throw when a lookup (user, task, group, ...) comes back empty.
 */
export class NotFoundError extends ApiError {
  constructor(message?: string){
    super(ErrorType.NOT_FOUND, message || ErrorMessage.NOT_FOUND)
  }
}

/**
 * 400 — a required input is missing.
 * Throw when the request payload is incomplete.
 */
export class NoEntryError extends ApiError {
  constructor(message?: string){
    super(ErrorType.NO_ENTRY, message || ErrorMessage.NO_ENTRY)
  }
}

/**
 * 400 — the request is valid but no data exists for it.
 * Throw when a query succeeds but returns nothing.
 */
export class NotDataError extends ApiError {
  constructor(message?: string){
    super(ErrorType.NO_DATA, message || ErrorMessage.NO_DATA)
  }
}

/**
 * 400 — bad request with an attached data payload.
 * Use for validation failures where you want to send details back, e.g.
 * field-level errors:
 *
 * @example
 * throw new BadRequestError("Validation failed.", { email: "invalid" });
 *
 * Note: unlike the other subclasses, `message` and `data` are REQUIRED here
 * (no default message).
 */
export class BadRequestError<T> extends ApiError {
  data: T;
  constructor(message: string, data: T){
    super(ErrorType.BAD_REQUEST, message || ErrorMessage.BAD_REQUEST)
    this.data = data;
  }
}

/**
 * 400 — bad request with a message only.
 * Use when the payload is invalid but you have no per-field details to send.
 */
export class BadRequestMsgError extends ApiError {
  constructor(message?: string){
    super(ErrorType.BAD_REQUEST_MSG, message || ErrorMessage.BAD_REQUEST_MSG)
  }
}

/**
 * 403 — the requestor is authenticated but lacks permission for this action.
 */
export class ForbiddenError extends ApiError {
  constructor(message?: string){
    super(ErrorType.FORBIDDEN, message || ErrorMessage.FORBIDDEN)
  }
}

/**
 * 500 — an unexpected server-side failure.
 * Keep as the last resort; prefer a specific error for known failures.
 *
 */
export class InternalError extends ApiError {
  constructor(message?: string){
    super(ErrorType.INTERNAL, message || ErrorMessage.INTERNAL)
  }
}

export default ApiError
