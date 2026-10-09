import { IconShieldExclamation } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/link-button";

interface TokenAlreadyUsedViewProps {
  email?: string;
}

export default function TokenAlreadyUsedView({ email }: TokenAlreadyUsedViewProps) {
  const newLinkHref = email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password";

  return (
    <div className="w-full rounded-2xl border border-destructive/30 bg-card/80 p-6 space-y-4 shadow-sm text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
        <IconShieldExclamation size={26} />
      </div>

      <div className="space-y-1">
        <p className="text-xl font-semibold">Reset link has already been used</p>
        <p className="text-sm text-muted-foreground">
          For your protection, password reset links can only be used once. This link has already been consumed and
          cannot be reused.
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground text-left leading-relaxed">
        To prevent account takeover, active sessions on all devices are safely terminated whenever a password reset
        occurs. If you still need to reset your password, please generate a fresh link.
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <LinkButton href={newLinkHref} className="w-full rounded-full text-base h-11">
          Request a new reset link
        </LinkButton>

        <LinkButton href="/login" variant="outline" className="w-full rounded-full text-base h-11">
          Back to login
        </LinkButton>
      </div>
    </div>
  );
}
