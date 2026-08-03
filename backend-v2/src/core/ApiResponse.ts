import { Response } from 'express';

/**
 * ============================================================================
 * ApiResponse — Centralized HTTP Response Layer
 * ============================================================================
 *
 * Every endpoint in this API responds through one of the classes below.
 * Controllers never hand-write `res.status(...).json(...)`; they pick a
 * response class, construct it, and call `.send(res)`:
 *
 *   @example
 *   return new SuccessResponse("User fetched.", user).send(res);
 *   return new NotFoundResponse("User does not exist.").send(res);
 *
 * Mental model (3 steps):
 *   1. Pick the class that matches the outcome (success / bad request / ...).
 *   2. Construct it with a message (+ optional payload for the `*Response<T>`
 *      variants).
 *   3. Call `.send(res)` — it sets the HTTP status and writes the JSON body.
 *
 * Shared plumbing lives in the abstract base class `ApiResponse`:
 *   - `statusCode`  -> the HTTP status written to the wire,
 *   - `message`     -> the human-readable body message,
 *   - `send()`      -> `prepare()` -> `res.status(code).json(sanitize(this))`.
 *
 * The companion file `./ApiError` reuses these classes to turn thrown errors
 * into HTTP responses (see `ApiError.handle()`), so success paths and error
 * paths both end up producing the exact same response shape.
 *
 * NOTE for copy-paste use: this file depends only on Express (the `Response`
 * type). It can be dropped into any Express + TypeScript project as-is.
 * ============================================================================
 */

/**
 * The HTTP status codes this API is allowed to send, keyed by semantic name.
 * Every ApiResponse subclass pins one of these at construction time.
 */
enum ResponseStatus {
  /** 200 — the request succeeded (used by all success responses). */
  SUCCESS = 200, 
  /** 204 — the request succeeded but there is no content to return. */
  NO_CONTENT = 204,
  /** 400 — the request was malformed or failed validation. */
  BAD_REQUEST = 400, 
  /** 401 — the requestor is not authenticated. */
  UNAUTHORIZED = 401, 
  /** 403 — the requestor is authenticated but not allowed to do this. */
  FORBIDDEN = 403, 
  /** 404 — the requested resource does not exist. */
  NOT_FOUND = 404, 
  /** 500 — an unexpected server-side failure occurred. */
  INTERNAL_ERROR = 500,
}

/**
 * Abstract base class for every API response.
 *
 * Subclasses do two jobs:
 *   1. fix a semantic (success / not-found / forbidden / ...) by passing the
 *      matching `ResponseStatus` into `super(...)`, and
 *   2. provide ergonomic constructors (message-only, or message + data).
 *
 * The base class owns the response pipeline (`send` -> `prepare` ->
 * `sanitize`) so every subclass produces an identical JSON shape.
 */
abstract class ApiResponse {
  /**
   * @param statusCode HTTP status that will be written to the wire.
   * @param message    Body message shown to the client.
   */
  constructor(
    public statusCode: ResponseStatus,
    public message: string,
  ) {}

  /**
   * Finalize the response: set the HTTP status, serialize the body and return
   * the Express `Response` so handlers can `return` it.
   *
   * Subclasses that carry a `data` payload override this to call
   * `super.prepare()` directly (skipping the debug log below).
   */
  public send(res: Response): Response {
    console.log(this.message) // TODO: debug leftover — remove before shipping.
    return this.prepare(res, this)
  }

  /**
   * Shared serializer used by `send()` and by subclasses that override it:
   * writes `this.statusCode` as the HTTP status and the sanitized response
   * object as the JSON body.
   *
   * @param res      The Express response object to write to.
   * @param response The response instance to serialize (normally `this`).
   */
  protected prepare(
    res: Response,
    response: ApiResponse,
  ) {
    return res.status(this.statusCode).json(ApiResponse.sanitize(response))
  }

  /**
   * Cleans a response object before it hits the wire:
   *   1. strips the internal `statusCode` property — the status already lives
   *      in the HTTP header, so it is not duplicated in the body, and
   *   2. removes every property whose value is `undefined`.
   *
   * Returns a plain object, so the client always gets a stable body shape:
   * `{ message, ...(data if present) }`.
   */
  private static sanitize<T extends Record<string, any>>(data: T) {
    const clone: Record<string, any> = {...data}

    if(clone?.statusCode !== undefined) delete clone.statusCode

    for (const i in clone) if (typeof clone[i] === 'undefined') delete clone[i]
    return clone
  }
}

/**
 * 200 — success with a message only (no payload).
 * Use for actions where there is nothing to return, e.g. "Password updated.".
 *
 * @example
 * return new SuccessMsgResponse("Account deleted.").send(res);
 */
export class SuccessMsgResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.SUCCESS, message || "Successfull fetch.")
  }
}

/**
 * 200 — success with a typed payload.
 * The workhorse success response: use for any read/fetch action that returns
 * data.
 *
 * @example
 * return new SuccessResponse("User list.", users).send(res);
 */
export class SuccessResponse<T> extends ApiResponse {
  data: T;
  constructor(message: string, data: T){
    super(ResponseStatus.SUCCESS, message || "Successfull fetch.");
    this.data = data;
  }

  public send(res: Response): Response {
    return super.prepare(res, this)
  }
}

/**
 * 400 — bad request with a message only.
 * Use when the payload is invalid but you have no per-field details to send.
 */
export class BadRequestMsgResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.BAD_REQUEST, message)
  }
}

/**
 * 400 — bad request with an attached payload.
 * Use when you want to send details back to the client, e.g. field-level
 * validation errors:
 *
 * @example
 * return new BadRequestResponse("Validation failed.", {
 *   email: "must be a valid email",
 * }).send(res);
 */
export class BadRequestResponse<T> extends ApiResponse {
  data: T;
  constructor(message: string, data: T){
    super(ResponseStatus.BAD_REQUEST, message)
    this.data = data
  }

  send(res: Response){
    return super.prepare(res, this)
  }
}

/**
 * Intended as a 204 "no content" response.
 *
 * NOTE: this class currently wires `ResponseStatus.NOT_FOUND` (404), not
 * `NO_CONTENT` (204) — likely a bug. Verify/fix before copy-pasting this file
 * into a new project.
 */
export class NoContentResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatus.NOT_FOUND, message)
  }
}

/**
 * 404 — the requested resource does not exist.
 * Use when a lookup (user, task, group, ...) comes back empty.
 *
 * @example
 * return new NotFoundResponse("User with id 42 not found.").send(res);
 */
export class NotFoundResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatus.NOT_FOUND, message)
  }
}

/**
 * 401 — the requestor is not authenticated.
 * Use for missing/invalid/expired credentials.
 */
export class UnauthorizedResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.UNAUTHORIZED, message)
  }
}

/**
 * 403 — the requestor is authenticated but lacks permission for this action.
 */
export class ForbiddenResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.FORBIDDEN, message)
  }
}

/**
 * 500 — an unexpected server-side failure.
 * Keep this as the last resort; prefer a specific error for known failures.
 */
export class InternalResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.INTERNAL_ERROR, message)
  }
}
