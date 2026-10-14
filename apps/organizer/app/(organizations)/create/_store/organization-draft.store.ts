import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftInfo, DraftStatus, SerializedDraftData, SerializedLogoData } from "./draft-types";

interface OrganizationDraftState {
  draft: SerializedDraftData | null;
  draftStatus: DraftStatus;
  lastSavedAt: string | null;
  hasSavedDraft: boolean;
  cachedLogo: SerializedLogoData | null;

  setDraftStatus: (status: DraftStatus) => void;
  saveDraft: (draft: SerializedDraftData, logo?: SerializedLogoData | null) => void;
  discardDraft: () => void;
  clearDraft: () => void;
  dismissRestoreBanner: () => void;
  getDraftInfo: () => DraftInfo | null;
}

export const useOrganizationDraftStore = create<OrganizationDraftState>()(
  persist(
    (set, get) => ({
      draft: null,
      draftStatus: "idle",
      lastSavedAt: null,
      hasSavedDraft: false,
      cachedLogo: null,

      setDraftStatus: (status: DraftStatus) => {
        set({ draftStatus: status });
      },

      saveDraft: (draft: SerializedDraftData, logo?: SerializedLogoData | null) => {
        const now = new Date().toISOString();
        set((state) => ({
          draft,
          draftStatus: "saved",
          lastSavedAt: now,
          cachedLogo: logo !== undefined ? logo : state.cachedLogo,
          hasSavedDraft: false,
        }));
      },

      discardDraft: () => {
        set({
          draft: null,
          draftStatus: "idle",
          lastSavedAt: null,
          hasSavedDraft: false,
          cachedLogo: null,
        });
      },

      clearDraft: () => {
        set({
          draft: null,
          draftStatus: "idle",
          lastSavedAt: null,
          hasSavedDraft: false,
          cachedLogo: null,
        });
      },

      dismissRestoreBanner: () => {
        set({ hasSavedDraft: false });
      },

      getDraftInfo: () => {
        const { draft } = get();
        if (!draft?.formData) return null;

        return {
          savedAt: new Date(draft.savedAt),
          step: draft.currentStep ?? 0,
          name: draft.formData.basicInfo?.name || "Untitled Organization",
        };
      },
    }),
    {
      name: "orgatick-create-org-draft",
      partialize: (state) => ({
        draft: state.draft,
        lastSavedAt: state.lastSavedAt,
        cachedLogo: state.cachedLogo,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.draft?.formData) return;

        const { formData, currentStep } = state.draft;
        const hasContent =
          Boolean(formData.basicInfo?.name?.trim()) ||
          currentStep > 0 ||
          Boolean(formData.address?.addressLine1?.trim()) ||
          formData.socialLinks?.some((l) => Boolean(l.url?.trim()));

        if (hasContent) {
          state.hasSavedDraft = true;
          state.draftStatus = "saved";
        }
      },
    },
  ),
);
