import { Response } from "express";

export enum ErrorType {
  BAD_TOKEN = "BadTokenError",
  TOKEN_EXPIRED = "TokenExpiredError",
  UNAUTHORIZED = "AuthFailureError",
  ACCESS_TOKEN = "AccessTokenError",
  INTERNAL = "InternalError",
  NOT_FOUND = "NotFoundError",
  NO_ENTRY = "NoEntryError",
  NO_DATA = "NoDataError",
  BAD_REQUEST = "BadRequestError",
  BAD_REQUEST_MSG = "BadRequestMsgError",
  FORBIDDEN = "ForbiddenError",
}

export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string = "error",
    public data?: any,
  ) {
    super(message); 
    // typescript automatically handle "this.type = type" part.
  }

  handle(err: ApiError, res: Response){
    
  }
}



export default ApiError