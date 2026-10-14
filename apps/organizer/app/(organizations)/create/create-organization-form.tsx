"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  type CreateOrganizationInput,
  type CreateOrganizationOutput,
  CreateOrganizationSchema,
} from "@orgatick/contracts";
import { toast } from "@/components/ui/sonner";
import { formDefaultValues } from "./_constents/defult-value";
import { ORGANIZATION_FORM_ID, ORGANIZATION_FORM_STEPS, type OrganizationFormStep } from "./_constents/form-steps";
import { ApplicationStepper, MobileStepProgress } from "./_components/application-stepper";
import { FormActionBar } from "./_components/form-action-bar";
import { SubmissionOverlay } from "./_components/submission-overlay";
import { DraftRestoreBanner } from "./_components/draft-restore-banner";
import { DraftStatusIndicator } from "./_components/draft-status-indicator";
import { useDraftSync } from "./_hooks/use-draft-sync";
import { BasicInfoStep } from "./_steps/basic-info-step";
import { AddressStep } from "./_steps/address-step";
import { DocumentsStep } from "./_steps/documents-step";
import { ContactsStep } from "./_steps/contacts-step";
import { ReviewStep } from "./_steps/review-step";
import { submitOrganizationApplication } from "./_utils/submit-organization";

export function CreateOrganizationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<CreateOrganizationInput, unknown, CreateOrganizationOutput>({
    resolver: zodResolver(CreateOrganizationSchema, {
      error: (iss) => {
        if (iss.path && iss.path.length === 2 && iss.path[0] === "basicInfo" && iss.path[1] === "subCategoryId") {
          return { message: "Please select a sub-category." };
        }
        return undefined;
      },
    }),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: formDefaultValues,
  });

  const { draftStatus, lastSavedAt, hasSavedDraft, draftInfo, saveDraft, restoreDraft, discardDraft, clearDraft } =
    useDraftSync({
      form,
      currentStep,
      onSetStep: (step) => advanceTo(step),
    });

  const currentStepConfig = (ORGANIZATION_FORM_STEPS[currentStep] ??
    ORGANIZATION_FORM_STEPS[0]) as OrganizationFormStep;

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ORGANIZATION_FORM_STEPS.length && stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
      window.scrollTo({ top: 0 });
    }
  };

  const advanceTo = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0 });
  };

  const nextStep = async () => {
    if (isValidating || isSubmitting) return;
    setIsValidating(true);
    try {
      const stepConfig = (ORGANIZATION_FORM_STEPS[currentStep] ?? ORGANIZATION_FORM_STEPS[0]) as OrganizationFormStep;
      if (stepConfig.fields.length > 0) {
        const isValid = await form.trigger(stepConfig.fields as unknown as (keyof CreateOrganizationInput)[]);
        if (!isValid) {
          toast.error("Please fill in all required fields properly before continuing.");
          return;
        }
      }
      advanceTo(Math.min(currentStep + 1, ORGANIZATION_FORM_STEPS.length - 1));
    } finally {
      setIsValidating(false);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) advanceTo(currentStep - 1);
  };

  const onSubmit = async (data: CreateOrganizationOutput) => {
    setIsSubmitting(true);
    try {
      await submitOrganizationApplication(data);
      clearDraft();
      toast.success("Organization successfully registered!", {
        description: "Your organization application is currently under review.",
      });
      router.replace("/");
    } catch (err: unknown) {
      console.error("Error creating organization:", err);
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const rawMessage = axiosErr?.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : typeof rawMessage === "string"
          ? rawMessage
          : "Failed to create organization. Please review your details and try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = () => {
    void form.handleSubmit(onSubmit)();
  };

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <aside className="hidden min-w-0 w-64 shrink-0 lg:sticky lg:top-6 lg:block xl:w-72">
          <ApplicationStepper currentStep={currentStep} onGoToStep={goToStep} />
        </aside>

        <form
          id={ORGANIZATION_FORM_ID}
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex w-full min-w-0 flex-col gap-6"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground sm:text-lg">{currentStepConfig.title}</h2>
              <p className="hidden text-xs text-muted-foreground sm:block">{currentStepConfig.description}</p>
            </div>

            <DraftStatusIndicator
              status={draftStatus}
              lastSavedAt={lastSavedAt}
              onSave={() => void saveDraft({ silent: false })}
              onDiscard={discardDraft}
            />
          </div>

          <div className="lg:hidden">
            <MobileStepProgress currentStep={currentStep} />
          </div>

          <AnimatePresence>
            {hasSavedDraft && draftInfo && (
              <DraftRestoreBanner draftInfo={draftInfo} onResume={restoreDraft} onDiscard={discardDraft} />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col gap-8"
            >
              {currentStep === 0 && <BasicInfoStep />}
              {currentStep === 1 && <AddressStep />}
              {currentStep === 2 && <DocumentsStep />}
              {currentStep === 3 && <ContactsStep />}
              {currentStep === 4 && <ReviewStep onEditStep={(index) => goToStep(index)} />}
            </motion.div>
          </AnimatePresence>

          <FormActionBar
            currentStep={currentStep}
            totalSteps={ORGANIZATION_FORM_STEPS.length}
            stepTitle={currentStepConfig.title}
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            isLastStep={currentStep === ORGANIZATION_FORM_STEPS.length - 1}
            draftStatus={draftStatus}
            lastSavedAt={lastSavedAt}
            onBack={previousStep}
            onNext={() => void nextStep()}
            onRegister={handleRegister}
            onSaveDraft={() => void saveDraft({ silent: false })}
          />
        </form>
      </div>

      <AnimatePresence>{isSubmitting && <SubmissionOverlay key="organization-submission" />}</AnimatePresence>
    </FormProvider>
  );
}
