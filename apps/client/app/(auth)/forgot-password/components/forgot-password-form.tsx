"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Step1Form from "./forgot-password-form/step-1-form";
import Step2Form from "./forgot-password-form/step-2-form";
import { useStepValidation } from "@/hooks/use-step-validation";
import { type ForgotPasswordData, forgotPasswordSchema } from "@orgatick/contracts";
import { useAuthStore } from "@/app/(auth)/_store";

const ForgotPasswordForm = () => {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isResending, setIsResending] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const loading = useAuthStore((state) => state.isLoading);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { validate, shouldRevalidate } = useStepValidation(form);

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      form.setValue("email", urlEmail);
      setSubmittedEmail(urlEmail);
    }
  }, [searchParams, form]);

  const handleSubmit = async (data: ForgotPasswordData) => {
    const valid = await validate(["email"]);
    if (!valid) return;

    const result = await forgotPassword(data);
    if (result.success) {
      setSubmittedEmail(data.email);
      setStep(2);
    }
  };

  const handleResend = async () => {
    const targetEmail = submittedEmail || form.getValues("email");
    if (!targetEmail) return;

    setIsResending(true);
    try {
      await forgotPassword({ email: targetEmail });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
          <Step1Form form={form} loading={loading} shouldRevalidate={shouldRevalidate} />
        </form>
      )}

      {step === 2 && (
        <Step2Form
          email={submittedEmail || form.getValues("email")}
          onResend={handleResend}
          isResending={isResending}
          setStep={setStep}
        />
      )}
    </div>
  );
};

export default ForgotPasswordForm;
