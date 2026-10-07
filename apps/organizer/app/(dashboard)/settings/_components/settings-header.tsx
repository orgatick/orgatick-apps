"use client";

import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { toast } from "sonner";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { IconCheck, IconCopy, IconShieldCheck } from "@tabler/icons-react";
import { useState } from "react";

interface SettingsHeaderProps {
  orgName: string;
  slug?: string;
  status?: string;
  verificationStatus?: OrganizationVerificationStatus | string;
}

export function SettingsHeader({ orgName, slug, status, verificationStatus }: SettingsHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copySlug = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    toast.success("Organization slug copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerified = verificationStatus === OrganizationVerificationStatus.VERIFIED;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
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
  );
}
