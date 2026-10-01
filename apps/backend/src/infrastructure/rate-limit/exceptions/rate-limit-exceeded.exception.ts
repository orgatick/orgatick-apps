import { HttpException, HttpStatus } from "@nestjs/common";

export interface RateLimitErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  retryAfter: number;
}

export class RateLimitExceededException extends HttpException {
  public readonly retryAfter: number;

  constructor(retryAfterSeconds: number, message = "Too many requests. Please try again later.") {
    const payload: RateLimitErrorResponse = {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: "RATE_LIMIT_EXCEEDED",
      message,
      retryAfter: Math.max(1, Math.ceil(retryAfterSeconds)),
    };

    super(payload, HttpStatus.TOO_MANY_REQUESTS);
    this.retryAfter = payload.retryAfter;
  }
}
