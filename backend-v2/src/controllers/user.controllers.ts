import type { Request, Response } from "express";

import type { User } from "../models/user.model";

export function registerController(req: Request, res: Response) {
  const { email, password } = req.body;
  
}