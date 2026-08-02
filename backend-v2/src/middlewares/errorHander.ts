import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/classes/AppError";

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (err instanceof AppError) {
    res
      .status(err.code ?? 400)
      .json({
        message: err.message,
        errors: err.errors
      });
    return;
  }

  res.status(500).json({ error: "Internal Server Error" });
}

export default errorHandler