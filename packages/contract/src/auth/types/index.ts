import type { z } from "zod";
import type { loginSchema } from "../schema/login.schema.js";
import type { signupSchema } from "../schema/signup.schema.js";
import type forgotPasswordSchema from "../schema/forgot-password.schema.js";
import type resetPasswordSchema from "../schema/reset-password.schema.js";
import type verifyEmailSchema from "../schema/verify-email.schema.js";
import type resendVerifyEmailSchema from "../schema/resend-verify-email.schema.js";

// Login Types
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginRequest = LoginInput;
export type LoginDTO = LoginInput;
export type LoginData = LoginInput;

// Signup Types
export type SignupInput = z.infer<typeof signupSchema>;
export type SignupRequest = SignupInput;
export type SignupDTO = SignupInput;
export type SignupData = SignupInput;

// Schema Types
export type LoginSchemaType = typeof loginSchema;
export type SignupSchemaType = typeof signupSchema;

// Forgot Password Types
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordRequest = ForgotPasswordInput;
export type ForgotPasswordDTO = ForgotPasswordInput;
export type ForgotPasswordData = ForgotPasswordInput;

// Reset Password Types
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordRequest = ResetPasswordInput;
export type ResetPasswordDTO = ResetPasswordInput;
export type ResetPasswordData = ResetPasswordInput;

// Verify Email Types
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type VerifyEmailRequest = VerifyEmailInput;
export type VerifyEmailDTO = VerifyEmailInput;
export type VerifyEmailData = VerifyEmailInput;

// Resend Verify Email Types
export type ResendVerifyEmailInput = z.infer<typeof resendVerifyEmailSchema>;
export type ResendVerifyEmailRequest = ResendVerifyEmailInput;
export type ResendVerifyEmailDTO = ResendVerifyEmailInput;
export type ResendVerifyEmailData = ResendVerifyEmailInput;
