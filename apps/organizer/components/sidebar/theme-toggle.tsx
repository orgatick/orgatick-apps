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

export const THEME_OPTIONS = [
  { value: "system", label: "System", description: "Follow device settings", icon: IconDeviceDesktop },
  { value: "light", label: "Light", description: "Clean & bright", icon: IconSun },
  { value: "dark", label: "Dark", description: "Easy on the eyes", icon: IconMoon },
] as const;

export type ThemeValue = (typeof THEME_OPTIONS)[number]["value"];

interface ThemeToggleProps {
  collapsed?: boolean;
  compact?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
}

export function ThemeToggle({ collapsed = false, compact = false, align = "start", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = (mounted ? (theme ?? "system") : "system") as ThemeValue;
  const CurrentIcon = THEME_OPTIONS.find((option) => option.value === current)?.icon ?? IconDeviceDesktop;
  const iconOnly = collapsed || compact;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={iconOnly ? "icon-sm" : "default"}
            aria-label={`Switch theme (current: ${current})`}
            title={`Switch theme (current: ${current})`}
            className={cn(
              "rounded-lg text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground aria-expanded:bg-muted/80",
              iconOnly ? "size-8 justify-center" : "h-9 w-full justify-start gap-2.5 px-2.5",
              className,
            )}
          >
            <CurrentIcon className="size-4 shrink-0" />
            {!iconOnly && (
              <>
                <span className="truncate text-sm font-medium">Appearance</span>
                <span className="ms-auto font-mono text-[11px] capitalize text-muted-foreground/80">{current}</span>
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align={align} sideOffset={8} className="w-52 p-1.5">
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Appearance</div>
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
              <div className="min-w-0 flex-1">
                <span className="block text-sm">{option.label}</span>
                <span className="block text-[11px] text-muted-foreground">{option.description}</span>
              </div>
              {isActive && <IconCheck className="size-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeOptions({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = (mounted ? (theme ?? "system") : "system") as ThemeValue;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors",
              isActive
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
                isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-[11px] text-muted-foreground">{option.description}</span>
            </div>
            {isActive ? (
              <IconCheck className="size-4 shrink-0 text-primary" />
            ) : (
              <span className="size-4 rounded-full border border-border" />
            )}
          </button>
        );
      })}
    </div>
  );
}
