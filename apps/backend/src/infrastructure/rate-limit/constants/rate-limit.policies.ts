import { AUTH_RATE_LIMIT_POLICIES } from "./policies/auth.policy";
import { GLOBAL_RATE_LIMIT_POLICIES } from "./policies/global.policy";
import { PASSKEY_RATE_LIMIT_POLICIES } from "./policies/passkey.policy";
import { UPLOAD_RATE_LIMIT_POLICIES } from "./policies/upload.policy";

export * from "./policies";

export const RATE_LIMIT_POLICIES = {
  global: GLOBAL_RATE_LIMIT_POLICIES.global,
  ...AUTH_RATE_LIMIT_POLICIES,
  passkeyAuth: PASSKEY_RATE_LIMIT_POLICIES.auth,
  passkeyRegister: PASSKEY_RATE_LIMIT_POLICIES.register,
  ...UPLOAD_RATE_LIMIT_POLICIES,
} as const;
