import type { Request, Response, NextFunction } from "express";
import ApiError, { ErrorType } from "../core/ApiError";

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (err instanceof ApiError) {
    return err.handle(err, res)
  }

  console.error("Server error:", err.message)
  res.status(500).json({ message: "Internal Server Error" });
}

export default errorHandler