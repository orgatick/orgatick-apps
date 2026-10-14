"use client";

import { Alert, AlertTitle, AlertDescription } from "@orgatick/ui/components/alert";
import { IconCheck, IconCircleDot, IconShieldCheck } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { ReviewProfileSection } from "./review/review-profile-section";
import { ReviewAddressAndDocs } from "./review/review-address-and-docs";
import { ReviewSocialAndContacts } from "./review/review-social-and-contacts";

interface ReviewStepProps {
  onEditStep: (stepIndex: number) => void;
}

export function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { watch } = useFormContext<CreateOrganizationInput>();
  const basicInfo = watch("basicInfo");
  const address = watch("address");
  const documents = watch("document") || [];
  const socialLinks = watch("socialLinks") || [];
  const supportContacts = watch("supportContacts") || [];

  const checks = [
    { label: "Profile & Branding", valid: Boolean(basicInfo?.name?.trim() && basicInfo?.email?.trim()), step: 0 },
    { label: "Registered Address", valid: Boolean(address?.addressLine1?.trim()), step: 1 },
    { label: "Compliance Docs", valid: documents.filter((d) => d.file instanceof File).length >= 2, step: 2 },
    { label: "Contacts & Social", valid: socialLinks.length > 0 && supportContacts.length > 0, step: 3 },
  ];

  const allComplete = checks.every((c) => c.valid);

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-primary/20 bg-primary/5">
        <IconShieldCheck className="size-5 text-primary" />
        <AlertTitle className="text-sm font-bold text-foreground">Review & Confirm Organization Application</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          Please review your information carefully before submitting. Once submitted, your organization profile will be
          created and queued for verification.
        </AlertDescription>
      </Alert>

      {/* Checklist Overview Card */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Application Verification Checklist
          </span>
          <span className="font-mono text-xs font-bold text-primary">
            {allComplete
              ? "All 4 Sections Ready"
              : `${checks.filter((c) => c.valid).length} / ${checks.length} Sections Ready`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {checks.map((check) => (
            <button
              key={check.label}
              type="button"
              onClick={() => onEditStep(check.step)}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-left text-xs transition-colors hover:border-primary/40 hover:bg-muted/40 cursor-pointer"
            >
              {check.valid ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <IconCheck className="size-3" />
                </span>
              ) : (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                  <IconCircleDot className="size-3" />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{check.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ReviewProfileSection onEdit={() => onEditStep(0)} />
      <ReviewAddressAndDocs onEditAddress={() => onEditStep(1)} onEditDocs={() => onEditStep(2)} />
      <ReviewSocialAndContacts onEdit={() => onEditStep(3)} />
    </div>
  );
}
