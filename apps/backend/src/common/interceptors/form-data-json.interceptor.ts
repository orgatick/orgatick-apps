import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from "@nestjs/common";
import type { Observable } from "rxjs";

@Injectable()
export class FormDataJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    if (req.body) {
      const jsonPayload = req.body.data || req.body.organizationData;
      if (typeof jsonPayload === "string") {
        try {
          const parsed = JSON.parse(jsonPayload);
          delete req.body.data;
          delete req.body.organizationData;
          Object.assign(req.body, parsed);
        } catch {
          // Agar invalid JSON hai toh validation pipe error de dega
        }
      }
    }
    return next.handle();
  }
}
