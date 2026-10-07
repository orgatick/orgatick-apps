"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";

interface UseAdminActionOptions {
  successMessage?: string;
  errorMessage?: string;
}

/** Runs an admin mutation, then refreshes the page and toasts the result. */
export function useAdminAction(options: UseAdminActionOptions = {}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<unknown>) =>
    startTransition(async () => {
      try {
        await action();
        router.refresh();
        toast.success(options.successMessage ?? "Action completed");
      } catch (error) {
        handleApiError(error, options.errorMessage ?? "Action failed");
      }
    });

  return { pending, run };
}
