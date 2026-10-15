"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { IconCopyright, IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { cn } from "@orgatick/ui/lib/utils";

const LEGAL_LINKS = [
  { label: "Terms", href: "/terms-and-conditions" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Refunds", href: "/refund-policy" },
  { label: "Delivery", href: "/delivery-policy" },
  { label: "Contact", href: "/contact" },
] as const;

const THEME_OPTIONS = [
  { value: "system", label: "System theme", icon: IconDeviceDesktop },
  { value: "light", label: "Light theme", icon: IconSun },
  { value: "dark", label: "Dark theme", icon: IconMoon },
] as const;

function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 text-xs text-muted-foreground border-t border-border/40 sm:border-t-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Left: Brand / Copyright & Legal Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground">
            <IconCopyright className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              <span suppressHydrationWarning>{currentYear}</span> Orgatick
              <span className="hidden md:inline"> All rights reserved.</span>
            </span>
          </div>

          <span className="hidden sm:inline-block h-3.5 w-px bg-border/60" aria-hidden="true" />

          <nav
            aria-label="Legal & Support Links"
            className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-4.5 gap-y-1"
          >
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors duration-200 hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Theme Switcher */}
        <div className="flex items-center justify-center sm:justify-end gap-2.5">
          <div
            role="radiogroup"
            aria-label="Theme selection"
            className="inline-flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5"
          >
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const isActive = mounted && (theme === value || (!theme && value === "system"));
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={label}
                  title={label}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-background text-foreground shadow-2xs font-medium"
                      : "hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
