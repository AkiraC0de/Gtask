import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/classes/AppError";

function unrecognizeRouteHandler(req: Request, res: Response, next: NextFunction) {
  const err = new AppError(404, `Route ${req.originalUrl} not found`);
  next(err);
}

export default unrecognizeRouteHandler