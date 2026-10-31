"use client";

import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { toast } from "sonner";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { IconCheck, IconCopy, IconCreditCard, IconSettings, IconShieldCheck, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@orgatick/ui/lib/utils";

interface SettingsHeaderProps {
  orgName: string;
  slug?: string;
  status?: string;
  verificationStatus?: OrganizationVerificationStatus | string;
}

export function SettingsHeader({ orgName, slug, status, verificationStatus }: SettingsHeaderProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const copySlug = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    toast.success("Organization slug copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerified = verificationStatus === OrganizationVerificationStatus.VERIFIED;

  const navTabs = [
    { label: "General Settings", href: "/settings", icon: IconSettings, exact: true },
    { label: "Subscription & Quotas", href: "/subscription", icon: IconCreditCard },
    { label: "Members & Team", href: "/members", icon: IconUsers },
    { label: "Verification", href: "/verification", icon: IconShieldCheck },
  ];

  return (
    <div className="space-y-6 border-b border-border/60 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Organization Settings
            </p>
            {status && <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>}
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{orgName}</h1>
          {slug && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="font-mono text-xs text-muted-foreground">@{slug}</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={copySlug}
                className="h-6 px-1.5 text-muted-foreground hover:text-foreground"
              >
                {copied ? <IconCheck className="size-3 text-primary" /> : <IconCopy className="size-3" />}
                <span className="sr-only">Copy slug</span>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isVerified ? "default" : "secondary"} className="gap-1.5 py-1 px-3">
            <IconShieldCheck className="size-3.5" />
            <span>{isVerified ? "Verified Organization" : "Verification Pending"}</span>
          </Badge>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-t border-border/40 pt-3">
        {navTabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
