import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";
import type { TokenPair } from "../types/token-pair.types";

@Injectable()
export class CookieService {
  private readonly cookieOptions: CookieOptions;
  private readonly refreshTokenTime: number = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  private readonly accessTokenTime: number = 15 * 60 * 1000; // 15 minutes in milliseconds
  constructor(private readonly configService: ConfigService) {
    const isProd = this.configService.get<string>("NODE_ENV") === "production";
    const configuredDomain = this.configService.get<string>("COOKIE_DOMAIN");
    const cookieDomain = isProd
      ? configuredDomain
      : configuredDomain && !configuredDomain.includes("localhost")
        ? configuredDomain
        : undefined;
    const isSecure = isProd || Boolean(cookieDomain && !cookieDomain.includes("localhost"));
    this.cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      path: "/",
    };
  }

  setAuthCookies(response: Response, token: TokenPair) {
    if (this.cookieOptions.domain) {
      response.clearCookie("access_token", { path: "/" });
      response.clearCookie("refresh_token", { path: "/" });
    }
    response.cookie("access_token", token.accessToken, { ...this.cookieOptions, maxAge: this.accessTokenTime });
    response.cookie("refresh_token", token.refreshToken, { ...this.cookieOptions, maxAge: this.refreshTokenTime });
  }

  setAccessToken(response: Response, accessToken: string) {
    if (this.cookieOptions.domain) {
      response.clearCookie("access_token", { path: "/" });
    }
    response.cookie("access_token", accessToken, { ...this.cookieOptions, maxAge: this.accessTokenTime });
  }

  clearAuthCookies(response: Response) {
    if (this.cookieOptions.domain) {
      response.clearCookie("access_token", { path: "/" });
      response.clearCookie("refresh_token", { path: "/" });
    }
    response.clearCookie("access_token", this.cookieOptions);
    response.clearCookie("refresh_token", this.cookieOptions);
  }

  getAccessToken(request: Request): string | null {
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }
    const authHeader = request.headers?.authorization;
    if (authHeader && typeof authHeader === "string") {
      const [type, token] = authHeader.split(" ");
      if (type?.toLowerCase() === "bearer" && token) {
        return token;
      }
    }
    return null;
  }

  getRefreshToken(request: Request): string | null {
    if (request.cookies?.refresh_token) {
      return request.cookies.refresh_token;
    }
    const headerToken = request.headers?.["x-refresh-token"];
    if (typeof headerToken === "string" && headerToken) {
      return headerToken;
    }
    return null;
  }
}
