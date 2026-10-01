import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (!isHttpException) {
      const logger = new Logger(AllExceptionsFilter.name);
      logger.error(
        `Unhandled server error: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }
    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    let errorMessage = "Internal server error";
    let code: string | undefined;
    let retryAfter: number | undefined;

    if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
      // biome-ignore lint/suspicious/noExplicitAny: Exception response shapes vary across exceptions
      const resObj = exceptionResponse as any;
      errorMessage = resObj.message || (typeof resObj.error === "string" ? resObj.error : JSON.stringify(resObj));
      code = resObj.code;
      retryAfter = resObj.retryAfter;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: errorMessage,
      ...(code ? { code } : {}),
      ...(retryAfter !== undefined ? { retryAfter } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
