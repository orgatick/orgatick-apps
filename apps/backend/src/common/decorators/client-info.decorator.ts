import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { parseDeviceName, parsePlatform } from "../utils/user-agent.util";

export interface ClientMetadata {
  ipAddress: string | null;
  userAgent: string | null;
  deviceId?: string | null;
  deviceIdentifier?: string | null;
  deviceName?: string | null;
  platform?: string | null;
}

export const ClientInfo = createParamDecorator((_data: unknown, ctx: ExecutionContext): ClientMetadata => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const forwardedFor = request.headers["x-forwarded-for"];
  let ipAddress: string | null = null;
  if (typeof forwardedFor === "string") {
    ipAddress = forwardedFor.split(",")[0].trim();
  } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    ipAddress = forwardedFor[0].trim();
  } else if (request.ip) {
    ipAddress = request.ip;
  } else if (request.socket?.remoteAddress) {
    ipAddress = request.socket.remoteAddress;
  }

  const userAgent = (request.headers["user-agent"] as string) || null;
  const reqBody = request.body && typeof request.body === "object" ? request.body : {};

  const explicitDeviceId =
    (request.headers["x-device-id"] as string) ||
    (request.headers["x-device-identifier"] as string) ||
    (reqBody.deviceId as string) ||
    (reqBody.deviceIdentifier as string) ||
    null;

  const deviceName =
    (request.headers["x-device-name"] as string) || (reqBody.deviceName as string) || parseDeviceName(userAgent);

  const platform =
    (request.headers["x-device-platform"] as string) || (reqBody.platform as string) || parsePlatform(userAgent);

  const deviceIdentifier =
    explicitDeviceId ||
    (userAgent ? `ua-${Buffer.from(userAgent).toString("base64url").slice(0, 32)}` : "unknown-device");

  return {
    ipAddress,
    userAgent,
    deviceId: explicitDeviceId,
    deviceIdentifier,
    deviceName,
    platform,
  };
});
