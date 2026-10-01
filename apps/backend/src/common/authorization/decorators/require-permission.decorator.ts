import { SetMetadata } from "@nestjs/common";
import type { PermissionKey } from "../permissions";

export const PERMISSION_KEY = "permissions";
export const RequirePermission = (...permissions: PermissionKey[]) => SetMetadata(PERMISSION_KEY, permissions);
