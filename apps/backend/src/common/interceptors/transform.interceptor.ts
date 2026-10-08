import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { serializeBigInt } from "../utils/bigint-serializer";

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        data: data != null ? serializeBigInt(data) : null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
