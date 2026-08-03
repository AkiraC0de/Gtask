import { Response } from "express";

import { 
  BadRequestMsgResponse,
  BadRequestResponse,
  ForbiddenResponse,
  InternalResponse,
  NotFoundResponse,
  UnauthorizedResponse
} from "./ApiResponse";

export enum ErrorType {
  INVALID_TOKEN = "InvalidTokenError", //
  TOKEN_EXPIRED = "TokenExpiredError",//
  UNAUTHORIZED = "AuthFailureError", //
  ACCESS_TOKEN = "AccessTokenError",
  NOT_FOUND = "NotFoundError",
  NO_ENTRY = "NoEntryError",
  NO_DATA = "NoDataError",
  BAD_REQUEST = "BadRequestError",
  BAD_REQUEST_MSG = "BadRequestMsgError",
  FORBIDDEN = "ForbiddenError",
  INTERNAL = "InternalError",
}

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

export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public data?: any,
  ) {
    super(message); 
    // typescript automatically handle "this.type = type" part.
  }

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

export class InvalidTokenError extends ApiError {
  constructor(message?: string){
    super(ErrorType.UNAUTHORIZED, message || ErrorMessage.INVALID_TOKEN)
  }
}

export class TokenExpiredError extends ApiError {
  constructor(message?: string){
    super(ErrorType.TOKEN_EXPIRED, message || ErrorMessage.TOKEN_EXPIRED)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message?: string){
    super(ErrorType.UNAUTHORIZED, message || ErrorMessage.UNAUTHORIZED)
  }
}

export class NotFoundError extends ApiError {
  constructor(message?: string){
    super(ErrorType.NOT_FOUND, message || ErrorMessage.NOT_FOUND)
  }
}

export class NoEntryError extends ApiError {
  constructor(message?: string){
    super(ErrorType.NO_ENTRY, message || ErrorMessage.NO_ENTRY)
  }
}

export class NotDataError extends ApiError {
  constructor(message?: string){
    super(ErrorType.NO_DATA, message || ErrorMessage.NO_DATA)
  }
}

export class BadRequestError<T> extends ApiError {
  data: T;
  constructor(message: string, data: T){
    super(ErrorType.BAD_REQUEST, message || ErrorMessage.BAD_REQUEST)
    this.data = data;
  }
}

export class BadRequestMsgError extends ApiError {
  constructor(message?: string){
    super(ErrorType.BAD_REQUEST_MSG, message || ErrorMessage.BAD_REQUEST_MSG)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message?: string){
    super(ErrorType.FORBIDDEN, message || ErrorMessage.FORBIDDEN)
  }
}

export class InteralError extends ApiError {
  constructor(message?: string){
    super(ErrorType.INTERNAL, message || ErrorMessage.INTERNAL)
  }
}

export default ApiError