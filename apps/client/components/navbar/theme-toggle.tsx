"use client";

import { useEffect, useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import { cn } from "@orgatick/ui/lib/utils";
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { DEFAULT_THEME, type ThemeValue } from "@/lib/theme";

const THEME_OPTIONS: ReadonlyArray<{
  value: ThemeValue;
  label: string;
  description: string;
  icon: typeof IconMoon;
}> = [
  {
    value: "system",
    label: "Device",
    description: "Follow system",
    icon: IconDeviceDesktop,
  },
  { value: "light", label: "Light", description: "Sunny vibes", icon: IconSun },
  { value: "dark", label: "Dark", description: "Night mode", icon: IconMoon },
];

interface ThemeToggleProps {
  /**
   * Theme read from the cookie while rendering on the server. Without it the server has no
   * idea which icon the client is about to render, which is a hydration mismatch.
   */
  initialTheme?: ThemeValue;
  className?: string;
}

export function ThemeToggle({ initialTheme = DEFAULT_THEME, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = (mounted ? (theme ?? initialTheme) : initialTheme) as ThemeValue;
  const CurrentIcon = THEME_OPTIONS.find((option) => option.value === current)?.icon ?? IconDeviceDesktop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Switch theme (currently ${current})`}
            title={`Switch theme (currently ${current})`}
            className="aria-expanded:bg-muted/80 cursor-pointer"
          >
            <CurrentIcon className="size-4.5" />
          </Button>
        }
        className={cn("hidden sm:flex", className)}
      />
      <DropdownMenuContent align="end" sideOffset={8} className="w-48 p-1.5">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Appearance</div>
        <DropdownMenuSeparator />
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = current === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "gap-2.5 py-2 ps-2 cursor-pointer",
                isActive && "bg-primary/10 font-medium text-primary focus:bg-primary/10 focus:text-primary",
              )}
            >
              <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="flex-1">
                <span className="block text-sm">{option.label}</span>
                <span className="block text-[11px] text-muted-foreground">{option.description}</span>
              </span>
              {isActive && <IconCheck className="size-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
