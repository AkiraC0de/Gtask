import type { Request, Response, NextFunction } from "express";
import AppError from "../core/ApiError";

function unrecognizeRouteHandler(req: Request, res: Response, next: NextFunction) {
  const err = new AppError(404, `Route ${req.originalUrl} not found`);
  next(err);
}

export default unrecognizeRouteHandler