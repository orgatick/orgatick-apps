import OrgatickLogo from "@orgatick/ui/assets/logo/orgatick-logo";
import { IconShieldCheck } from "@tabler/icons-react";

export default function RootLoading() {
  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center p-4 bg-background text-foreground overflow-hidden select-none"
      role="status"
      aria-live="polite"
      aria-label="Loading workspace..."
    >
      {/* Subtle Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      {/* Floating Centered Card */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full rounded-2xl border border-border/70 bg-card/85 p-8 shadow-sm backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Layered Brand Mark */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="relative size-14 rounded-2xl bg-background border border-border/80 p-2.5 shadow-xs flex items-center justify-center">
            <OrgatickLogo className="size-full" />
          </div>
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1.5 rounded-2xl bg-primary/10 animate-pulse -z-10" aria-hidden="true" />
        </div>

        {/* Status Eyebrow */}
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">
          Syncing Workspace
        </p>

        {/* Title */}
        <h1 className="text-base font-bold tracking-tight text-foreground mb-1.5">Loading Organizer</h1>

        {/* Subtitle */}
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mb-6">
          Preparing your organization dashboard, event permissions, and live data…
        </p>

        {/* Indeterminate Shimmer Bar */}
        <div className="relative h-1 w-44 overflow-hidden rounded-full bg-muted/80 mb-5" aria-hidden="true">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        </div>

        {/* Security & Verification Micro-label */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/70">
          <IconShieldCheck className="size-3 text-primary/70" />
          <span>Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
