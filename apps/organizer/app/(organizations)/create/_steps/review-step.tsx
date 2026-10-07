"use client";

import { Alert, AlertTitle, AlertDescription } from "@orgatick/ui/components/alert";
import { IconShieldCheck } from "@tabler/icons-react";
import { ReviewProfileSection } from "./review/review-profile-section";
import { ReviewAddressAndDocs } from "./review/review-address-and-docs";
import { ReviewSocialAndContacts } from "./review/review-social-and-contacts";

interface ReviewStepProps {
  onEditStep: (stepIndex: number) => void;
}

export function ReviewStep({ onEditStep }: ReviewStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Alert>
        <IconShieldCheck className="size-4" />
        <AlertTitle>Review & Confirm Organization Application</AlertTitle>
        <AlertDescription>
          Please verify all details before submitting. Once submitted, our team will review compliance documents.
        </AlertDescription>
      </Alert>

      <ReviewProfileSection onEdit={() => onEditStep(0)} />
      <ReviewAddressAndDocs onEditAddress={() => onEditStep(1)} onEditDocs={() => onEditStep(2)} />
      <ReviewSocialAndContacts onEdit={() => onEditStep(3)} />
    </div>
  );
}
