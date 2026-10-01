import type { RateLimitPolicy } from "../../types/rate-limit.types";
import { RateLimitExtractors } from "../../utils/extractors.util";

export const AUTH_RATE_LIMIT_POLICIES = {
  /** Login attempt limit per IP (5 requests per 1 minute). */
  login: {
    limit: 5,
    windowSeconds: 60,
    keyPrefix: "login:ip",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many login attempts from this IP. Please try again in a few moments.",
  } satisfies RateLimitPolicy,

  /** Login attempt limit per account/email (5 requests per 1 minute). */
  loginAccount: {
    limit: 5,
    windowSeconds: 60,
    keyPrefix: "login:account",
    extractors: [RateLimitExtractors.emailFromBody("email")],
    message: "Too many login attempts for this account. Please try again in a few moments.",
  } satisfies RateLimitPolicy,

  /** Registration limit per IP (3 requests per 1 minute). */
  register: {
    limit: 3,
    windowSeconds: 60,
    keyPrefix: "register:ip",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many registration attempts. Please try again shortly.",
  } satisfies RateLimitPolicy,

  /** Registration limit per email address (3 requests per 1 minute). */
  registerAccount: {
    limit: 3,
    windowSeconds: 60,
    keyPrefix: "register:account",
    extractors: [RateLimitExtractors.emailFromBody("email")],
    message: "Too many registration attempts for this email address.",
  } satisfies RateLimitPolicy,

  /** Password reset request limit per IP (3 requests per 15 minutes). */
  passwordReset: {
    limit: 3,
    windowSeconds: 900,
    keyPrefix: "password_reset:ip",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many password reset requests from this IP. Please wait 15 minutes.",
  } satisfies RateLimitPolicy,

  /** Password reset request limit per account/email (3 requests per 15 minutes). */
  passwordResetAccount: {
    limit: 3,
    windowSeconds: 900,
    keyPrefix: "password_reset:account",
    extractors: [RateLimitExtractors.emailFromBody("email")],
    message: "Too many password reset requests for this account. Please wait 15 minutes.",
  } satisfies RateLimitPolicy,

  /** Email verification attempt limit per IP (5 requests per 15 minutes). */
  emailVerification: {
    limit: 5,
    windowSeconds: 900,
    keyPrefix: "email_verify:ip",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many email verification attempts from this IP. Please wait 15 minutes.",
  } satisfies RateLimitPolicy,

  /** Email verification attempt limit per email (5 requests per 15 minutes). */
  emailVerificationAccount: {
    limit: 5,
    windowSeconds: 900,
    keyPrefix: "email_verify:account",
    extractors: [RateLimitExtractors.emailFromBody("email")],
    message: "Too many email verification attempts for this account.",
  } satisfies RateLimitPolicy,

  /** OTP verification limit (5 attempts per 10 minutes). */
  otpVerify: {
    limit: 5,
    windowSeconds: 600,
    keyPrefix: "otp_verify",
    extractors: [RateLimitExtractors.userOrIp()],
    message: "Too many OTP verification attempts. Please wait 10 minutes.",
  } satisfies RateLimitPolicy,
} as const;
