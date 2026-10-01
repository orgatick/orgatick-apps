import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";
import {
  CURRENT_ORGANIZATION_COOKIE_MAX_AGE_MS,
  CURRENT_ORGANIZATION_COOKIE_NAME,
} from "../constants/organization-context.constants";

@Injectable()
export class OrganizationContextCookieService {
  private readonly cookieOptions: CookieOptions;

  constructor(configService: ConfigService) {
    const isProd = configService.get<string>("NODE_ENV") === "production";
    this.cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: CURRENT_ORGANIZATION_COOKIE_MAX_AGE_MS,
      domain: configService.get<string>("COOKIE_DOMAIN") || undefined,
    };
  }

  getOrganizationId(request: Request): string | null {
    const value = request.cookies?.[CURRENT_ORGANIZATION_COOKIE_NAME];
    return typeof value === "string" && /^\d+$/.test(value) ? value : null;
  }

  setOrganizationId(response: Response, organizationId: bigint): void {
    response.cookie(CURRENT_ORGANIZATION_COOKIE_NAME, organizationId.toString(), this.cookieOptions);
  }

  clearOrganizationId(response: Response): void {
    response.clearCookie(CURRENT_ORGANIZATION_COOKIE_NAME, this.cookieOptions);
  }
}
