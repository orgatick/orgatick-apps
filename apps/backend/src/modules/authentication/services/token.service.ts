import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import type { JwtPayload } from "../types/jwt-payload.types";
import type { TokenPair } from "../types/token-pair.types";

@Injectable()
export class TokenService {
  private readonly refreshTokenTime: JwtSignOptions["expiresIn"] = "30d"; // 30 days
  private readonly accessTokenTime: JwtSignOptions["expiresIn"] = "15m"; // 15 minutes

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_SECRET"),
      expiresIn: this.accessTokenTime,
    });
  }
  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_SECRET"),
      expiresIn: this.refreshTokenTime,
    });
  }

  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);
    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  decode(token: string): JwtPayload | null {
    return this.jwtService.decode<JwtPayload>(token);
  }
}
