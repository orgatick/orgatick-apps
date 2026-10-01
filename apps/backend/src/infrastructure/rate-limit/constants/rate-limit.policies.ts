import { AUTH_RATE_LIMIT_POLICIES } from "./policies/auth.policy";
import { GLOBAL_RATE_LIMIT_POLICIES } from "./policies/global.policy";
import { NEWSLETTER_RATE_LIMIT_POLICIES } from "./policies/newsletter.policy";
import { PASSKEY_RATE_LIMIT_POLICIES } from "./policies/passkey.policy";
import { UPLOAD_RATE_LIMIT_POLICIES } from "./policies/upload.policy";

export * from "./policies";

export const RATE_LIMIT_POLICIES = {
  global: GLOBAL_RATE_LIMIT_POLICIES.global,
  ...AUTH_RATE_LIMIT_POLICIES,
  newsletterSubscribe: NEWSLETTER_RATE_LIMIT_POLICIES.subscribe,
  newsletterSubscribeAccount: NEWSLETTER_RATE_LIMIT_POLICIES.subscribeAccount,
  newsletterSelfService: NEWSLETTER_RATE_LIMIT_POLICIES.selfService,
  newsletterConfirm: NEWSLETTER_RATE_LIMIT_POLICIES.confirm,
  newsletterDispatch: NEWSLETTER_RATE_LIMIT_POLICIES.dispatch,
  newsletterDispatchThroughput: NEWSLETTER_RATE_LIMIT_POLICIES.dispatchThroughput,
  passkeyAuth: PASSKEY_RATE_LIMIT_POLICIES.auth,
  passkeyRegister: PASSKEY_RATE_LIMIT_POLICIES.register,
  ...UPLOAD_RATE_LIMIT_POLICIES,
} as const;
