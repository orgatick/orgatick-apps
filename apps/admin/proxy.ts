import { createAuthMiddleware } from "@orgatick/auth";

export const proxy = createAuthMiddleware();

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
