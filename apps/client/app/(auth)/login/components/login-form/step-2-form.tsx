"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Controller, type UseFormReturn } from "react-hook-form";
import { IconKey, IconLoader2, IconLock, IconShieldLock } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@orgatick/ui/components/alert";
import { Button } from "@orgatick/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import PasswordInput from "@orgatick/ui/components/password-input";
import type { LoginData } from "@orgatick/contracts";
import EmailView from "@/app/(auth)/_components/EmailView";

interface Step2FormProps {
  form: UseFormReturn<LoginData>;
  setStep: (step: number) => void;
  isLoading?: boolean;
  lockout?: {
    isLocked: boolean;
    retryAfterSeconds: number;
    message?: string;
  } | null;
  onClearLockout?: () => void;
}

export default function Step2Form({ form, setStep, isLoading, lockout, onClearLockout }: Step2FormProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(lockout?.retryAfterSeconds ?? 0);

  useEffect(() => {
    if (lockout?.retryAfterSeconds) {
      setSecondsRemaining(lockout.retryAfterSeconds);
    }
  }, [lockout]);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClearLockout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, onClearLockout]);

  const isLocked = Boolean(lockout?.isLocked && secondsRemaining > 0);
  const isSubmitting = isLoading || form.formState.isSubmitting;
  const email = form.getValues("email");

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <FieldGroup>
      <EmailView email={email} onBack={() => setStep(1)} message="Logging in with email" />

      {/* Lockout Security Alert */}
      {isLocked && (
        <Alert variant="destructive" className="border-destructive/40 bg-destructive/5 text-start">
          <IconShieldLock className="size-5 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1.5 w-full">
            <AlertTitle className="text-sm font-semibold text-destructive flex items-center justify-between">
              <span>Account Temporarily Suspended</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-bold">
                {formatTimer(secondsRemaining)}
              </span>
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
              {lockout?.message ||
                "Too many consecutive failed login attempts were detected. For your security, authentication is temporarily throttled."}
            </AlertDescription>
            <div className="pt-1.5">
              <Link
                href={`/forgot-password?email=${encodeURIComponent(email)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
              >
                <IconKey className="size-3.5" />
                Reset your password to unlock your account immediately &rarr;
              </Link>
            </div>
          </div>
        </Alert>
      )}

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-center justify-between">
              <FieldLabel className="text-sm font-medium">Password</FieldLabel>
              <Link
                href={`/forgot-password?email=${encodeURIComponent(email)}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              {...field}
              aria-invalid={fieldState.invalid}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="text-base h-11"
              disabled={isSubmitting || isLocked}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex flex-col gap-2 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || isLocked}
          className="w-full rounded-full text-base h-12 font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <IconLoader2 className="size-5 animate-spin" />
              Signing in...
            </span>
          ) : isLocked ? (
            <span className="flex items-center gap-2">
              <IconLock className="size-4" />
              Locked ({formatTimer(secondsRemaining)})
            </span>
          ) : (
            "Continue with Password"
          )}
        </Button>
      </div>
    </FieldGroup>
  );
}
