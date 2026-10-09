"use client";

import { authService } from "@/app/(auth)/_services/auth.service";
import { useAuthStore } from "@/app/(auth)/_store";
import { clearAccessToken } from "@/lib/apis/auth.api";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network or token expiry errors on logout.
    }
    clearAccessToken();
    clearAuth();
    toast.info("You have been signed out.");
    router.refresh();
  };
}
