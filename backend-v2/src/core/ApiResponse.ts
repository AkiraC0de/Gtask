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

enum ResponseMessage {
  SUCCESS = "Successfull fetch.",
  UNAUTHORIZED = "You are unauthorized.",
  NOT_FOUND = "Not found."
}

abstract class ApiResponse {
  constructor(
    public statusCode: ResponseStatus,
    public message: string,
  ) {}

  public send(res: Response): Response {
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
    super(ResponseStatus.SUCCESS, message || ResponseMessage.SUCCESS)
  }
}

export class SuccessResponse<T> extends ApiResponse {
  data: T;
  constructor(message: string, data: T){
    super(ResponseStatus.SUCCESS, message || ResponseMessage.SUCCESS);
    this.data = data;
  }

  public send(res: Response): Response {
    return super.prepare(res, this)
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(message?: string) {
    super(ResponseStatus.NOT_FOUND, message || ResponseMessage.NOT_FOUND)
  }
}

export class UnauthorizedResponse extends ApiResponse {
  constructor(message?: string){
    super(ResponseStatus.UNAUTHORIZED, message || ResponseMessage.UNAUTHORIZED)
  }
}