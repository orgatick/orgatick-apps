import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { isAxiosError } from "axios";
import type { Request, Response } from "express";
import { Transactional } from "typeorm-transactional";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";
import { CookieService } from "./cookies.service";
import { LoginAttemptService } from "@/modules/identity/service/login-attempt.service";
import { UserDeviceService } from "@/modules/identity/service/user-device.service";
import { OAuthService } from "./oauth.service";
import type { GoogleTokenResponse, GoogleUserProfile, OAuthProfile } from "../types/oauth-google.types";
import type { ClientMetadata } from "@/common/decorators/client-info.decorator";
import { AuthProvider } from "@/modules/identity/entities/user-account.entity";
import { LoginAttemptStatus } from "@/modules/identity/entities/user-login-attempt.entity";

@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly userDeviceService: UserDeviceService,
    private readonly oauthService: OAuthService,
  ) {}

  redirectToGoogleOAuth(req: Request) {
    const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
    const redirectUri = this.configService.get<string>("GOOGLE_CALLBACK_URL");
    if (!clientId || !redirectUri) throw new BadRequestException("Google OAuth is not configured properly");
    const redirectIntent = req.query.redirect as string | undefined;
    const safeRedirect = this.resolveRedirect(redirectIntent);
    const state = safeRedirect
      ? Buffer.from(JSON.stringify({ redirect: safeRedirect })).toString("base64url")
      : undefined;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      access_type: "offline",
      ...(state && { state }),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  @Transactional()
  async authenticateWithGoogle(code: string, response?: Response, clientInfo?: ClientMetadata) {
    const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
    const clientSecret = this.configService.get<string>("GOOGLE_CLIENT_SECRET");
    const redirectUri = this.configService.get<string>("GOOGLE_CALLBACK_URL");
    let tokenRes: { data: GoogleTokenResponse };
    try {
      tokenRes = await axios.post<GoogleTokenResponse>(
        "https://oauth2.googleapis.com/token",
        {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
    } catch (error: unknown) {
      const errorMsg =
        (isAxiosError(error) && (error.response?.data?.error_description || error.response?.data?.error)) ||
        "Google token exchange failed";
      throw new BadRequestException(errorMsg);
    }

    if (!tokenRes.data?.access_token)
      throw new BadRequestException("Google authentication failed: access token missing");

    let profileRes: { data: GoogleUserProfile };
    try {
      profileRes = await axios.get<GoogleUserProfile>("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
      });
    } catch (error: unknown) {
      const errorMsg =
        (isAxiosError(error) && (error.response?.data?.error_description || error.response?.data?.error)) ||
        "Failed to fetch Google user profile";
      throw new BadRequestException(errorMsg);
    }

    if (!profileRes.data?.sub || !profileRes.data?.email)
      throw new BadRequestException("Google authentication failed: missing profile information");

    const profile: OAuthProfile = {
      provider: AuthProvider.GOOGLE,
      providerId: profileRes.data.sub,
      email: profileRes.data.email,
      name: profileRes.data.name || profileRes.data.email.split("@")[0],
      avatar: profileRes.data.picture,
      emailVerified: profileRes.data.email_verified,
    };
    const user = await this.oauthService.findOrCreateOAuthUser(profile);
    let resolvedDeviceId: string | null = clientInfo?.deviceId ?? null;
    if (clientInfo?.deviceIdentifier) {
      const device = await this.userDeviceService.registerOrUpdateDevice(user.id, {
        deviceIdentifier: clientInfo.deviceIdentifier,
        name: clientInfo.deviceName,
        platform: clientInfo.platform,
      });
      resolvedDeviceId = device.id;
    }
    const sessionClientInfo: ClientMetadata = {
      ipAddress: clientInfo?.ipAddress ?? null,
      userAgent: clientInfo?.userAgent ?? null,
      deviceId: resolvedDeviceId,
    };
    const session = await this.sessionService.createSession(user, sessionClientInfo);
    await this.loginAttemptService.recordAttempt({
      email: user.email,
      userId: user.id,
      ipAddress: clientInfo?.ipAddress,
      userAgent: clientInfo?.userAgent,
      status: LoginAttemptStatus.SUCCESS,
      failureReason: null,
    });

    const token = await this.tokenService.generateTokenPair({
      email: user.email,
      sessionId: session.id,
      token: session.sessionToken,
      rotationCounter: session.rotationCounter ?? 1,
    });
    if (response) this.cookieService.setAuthCookies(response, token);
    return user;
  }

  private resolveRedirect(redirect?: string): string | undefined {
    if (!redirect) return undefined;
    if (redirect.startsWith("/")) return redirect;
    try {
      const parsed = new URL(redirect);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return redirect;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
}
