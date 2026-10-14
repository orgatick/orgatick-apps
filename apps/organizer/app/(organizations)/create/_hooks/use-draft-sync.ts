"use client";

import { useCallback, useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateOrganizationInput, CreateOrganizationOutput } from "@orgatick/contracts";
import { toast } from "@/components/ui/sonner";
import { formDefaultValues } from "../_constents/defult-value";
import { deserializeDraftValues, serializeFormValues } from "../_store/draft-helpers";
import { useOrganizationDraftStore } from "../_store/organization-draft.store";

interface UseDraftSyncProps {
  form: UseFormReturn<CreateOrganizationInput, unknown, CreateOrganizationOutput>;
  currentStep: number;
  onSetStep: (step: number) => void;
}

export function useDraftSync({ form, currentStep, onSetStep }: UseDraftSyncProps) {
  const isInitialMount = useRef(true);
  const isRestoring = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const draft = useOrganizationDraftStore((s) => s.draft);
  const draftStatus = useOrganizationDraftStore((s) => s.draftStatus);
  const lastSavedAt = useOrganizationDraftStore((s) => s.lastSavedAt);
  const hasSavedDraft = useOrganizationDraftStore((s) => s.hasSavedDraft);
  const cachedLogo = useOrganizationDraftStore((s) => s.cachedLogo);
  const setDraftStatus = useOrganizationDraftStore((s) => s.setDraftStatus);
  const saveDraftToStore = useOrganizationDraftStore((s) => s.saveDraft);
  const discardDraftInStore = useOrganizationDraftStore((s) => s.discardDraft);
  const clearDraftInStore = useOrganizationDraftStore((s) => s.clearDraft);
  const getDraftInfo = useOrganizationDraftStore((s) => s.getDraftInfo);

  const draftInfo = getDraftInfo();

  const handleSaveDraft = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        setDraftStatus("saving");
        const currentValues = form.getValues();
        const { draft: serializedDraft, logo } = await serializeFormValues(currentValues, currentStep, cachedLogo);
        saveDraftToStore(serializedDraft, logo);

        if (!options?.silent) {
          toast.success("Draft saved successfully", {
            description: "Your progress is saved on this device and can be resumed anytime.",
          });
        }
      } catch (err) {
        console.error("Failed to save draft:", err);
        setDraftStatus("unsaved");
        if (!options?.silent) {
          toast.error("Failed to save draft.");
        }
      }
    },
    [form, currentStep, cachedLogo, setDraftStatus, saveDraftToStore],
  );

  const handleRestoreDraft = useCallback(() => {
    if (!draft?.formData) return;

    try {
      isRestoring.current = true;
      const { values, step, logo } = deserializeDraftValues(draft);
      form.reset(values);
      saveDraftToStore(draft, logo);
      onSetStep(step);

      toast.success("Draft restored!", {
        description: `Resumed from ${new Date(draft.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
      });

      setTimeout(() => {
        isRestoring.current = false;
      }, 500);
    } catch (err) {
      console.error("Failed to restore draft:", err);
      toast.error("Could not restore draft.");
      isRestoring.current = false;
    }
  }, [draft, form, onSetStep, saveDraftToStore]);

  const handleDiscardDraft = useCallback(() => {
    discardDraftInStore();
    form.reset(formDefaultValues);
    onSetStep(0);
    toast.info("Draft discarded", {
      description: "Starting with a fresh application.",
    });
  }, [discardDraftInStore, form, onSetStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSaveDraft({ silent: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveDraft]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (isInitialMount.current || isRestoring.current) {
        isInitialMount.current = false;
        return;
      }

      setDraftStatus("unsaved");

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const currentValues = form.getValues();
        const hasMeaningfulData =
          Boolean(currentValues.basicInfo?.name?.trim()) ||
          currentStep > 0 ||
          Boolean(currentValues.address?.addressLine1?.trim());

        if (hasMeaningfulData) {
          void handleSaveDraft({ silent: true });
        }
      }, 1500);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [form, currentStep, handleSaveDraft, setDraftStatus]);

  return {
    draftStatus,
    lastSavedAt: lastSavedAt ? new Date(lastSavedAt) : null,
    hasSavedDraft,
    draftInfo,
    saveDraft: handleSaveDraft,
    restoreDraft: handleRestoreDraft,
    discardDraft: handleDiscardDraft,
    clearDraft: clearDraftInStore,
  };
}
