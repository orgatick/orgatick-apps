"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/app/(auth)/_store";

// Guards against React StrictMode's double mount, which would otherwise start two refreshes.
let started = false;

/**
 * Resolves the persisted session once when the app loads: refreshes the access token and pulls the
 * profile, then marks auth as initialized. Without this, `isInitialized` never becomes true and
 * anything waiting on it waits forever.
 */
export function AuthBootstrap() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    if (started) return;
    started = true;
    void initializeAuth();
  }, [initializeAuth]);

  return null;
}
