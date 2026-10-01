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
    this.cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: this.configService.get<string>("COOKIE_DOMAIN"),
      path: "/",
    };
  }

  setAuthCookies(response: Response, token: TokenPair) {
    response.cookie("access_token", token.accessToken, { ...this.cookieOptions, maxAge: this.accessTokenTime });
    response.cookie("refresh_token", token.refreshToken, { ...this.cookieOptions, maxAge: this.refreshTokenTime });
  }
  setAccessToken(response: Response, accessToken: string) {
    response.cookie("access_token", accessToken, { ...this.cookieOptions, maxAge: this.accessTokenTime });
  }

  clearAuthCookies(response: Response) {
    response.clearCookie("access_token", this.cookieOptions);
    response.clearCookie("refresh_token", this.cookieOptions);
  }

  getAccessToken(request: Request): string | null {
    return request.cookies?.access_token || null;
  }

  getRefreshToken(request: Request): string | null {
    return request.cookies?.refresh_token || null;
  }
}
