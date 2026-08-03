import type { Request, Response } from "express";

import type { User } from "../models/user.model";
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse";

export function registerController(req: Request, res: Response) {
  return new SuccessResponse<object>("TITE", {TAE: []}).send(res)


}