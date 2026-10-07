"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

const THEME_TRANSITION_MS = 380;

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    const root = document.documentElement;
    const classList = root.classList;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type !== "attributes" || record.attributeName !== "class") continue;
        const wasDark = record.oldValue?.split(/\s+/).includes("dark") ?? false;
        if (wasDark === classList.contains("dark")) continue;
        classList.add("theme-transition");
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => classList.remove("theme-transition"), THEME_TRANSITION_MS);
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"], attributeOldValue: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // React 19 refuses to execute a <script> it creates during a client render (and logs an
  // error for it), so the no-flash script is only emitted from the server, where it runs as the
  // HTML parses. On the client it is re-created inert — its job is already done by then, and the
  // effect above re-applies the theme on any remount. See next-themes issue #387.
  const scriptProps = typeof window === "undefined" ? undefined : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
