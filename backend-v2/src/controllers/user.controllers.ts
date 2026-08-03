import type { Request, Response } from "express";

import type { User } from "../models/user.model";
import { SuccessMsgResponse, SuccessResponse, UnauthorizedResponse } from "../core/ApiResponse";
import { TokenExpiredError, UnauthorizedError } from "../core/ApiError";

export function registerController(req: Request, res: Response) {
  throw new TokenExpiredError()
  return new SuccessResponse("TITE", {TAE: []}).send(res)


}