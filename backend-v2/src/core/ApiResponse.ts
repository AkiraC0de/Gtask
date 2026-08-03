import { Response } from 'express';

enum ResponseStatus {
  SUCCESS = 200, 
  NO_CONTENT = 204,
  BAD_REQUEST = 400, 
  UNAUTHORIZED = 401, 
  FORBIDDEN = 403, 
  NOT_FOUND = 404, 
  INTERNAL_ERROR = 500,
}

abstract class ApiResponse {
  constructor(
    public statusCode: ResponseStatus,
    public message: string,
  ) {}

  public send(res: Response): Response {
    console.log(this.message)
    return this.prepare(res, this)
  }

  protected prepare(
    res: Response,
    response: ApiResponse,
  ) {
    return res.status(this.statusCode).json(ApiResponse.sanitize(response))
  }

  private static sanitize<T extends Record<string, any>>(data: T) {
    const clone: Record<string, any> = {...data}

    if(clone?.statusCode !== undefined) delete clone.statusCode

    for (const i in clone) if (typeof clone[i] === 'undefined') delete clone[i]
    return clone
  }
}

export class SuccessMsgResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.SUCCESS, message || "Successfull fetch.")
  }
}

export class SuccessResponse<T> extends ApiResponse {
  data: T;
  constructor(message: string, data: T){
    super(ResponseStatus.SUCCESS, message || "Successfull fetch.");
    this.data = data;
  }

  public send(res: Response): Response {
    return super.prepare(res, this)
  }
}

export class BadRequestMsgResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.BAD_REQUEST, message)
  }
}

export class BadRequestResponse<T> extends ApiResponse {
  data: T;
  constructor(message: string, data: T){
    super(ResponseStatus.BAD_REQUEST, message)
    this.data = data
  }

  send(res: Response){
    return super.prepare(res, this)
  }
}

export class NoContentResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatus.NOT_FOUND, message)
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatus.NOT_FOUND, message)
  }
}

export class UnauthorizedResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.UNAUTHORIZED, message)
  }
}

export class ForbiddenResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.FORBIDDEN, message)
  }
}

export class InternalResponse extends ApiResponse {
  constructor(message: string){
    super(ResponseStatus.INTERNAL_ERROR, message)
  }
}
