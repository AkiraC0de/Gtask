import type { Request, Response, NextFunction } from "express";
import AppError from "../core/ApiError";

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (err instanceof AppError) {
    return res
            .status(err.code ?? 400)
            .json({
              message: err.message,
              errors: err.errors
            });
  }

  console.error("Server error:", err.message)
  res.status(500).json({ message: "Internal Server Error" });
}

export default errorHandler