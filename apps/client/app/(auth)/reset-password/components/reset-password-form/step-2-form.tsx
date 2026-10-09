import { LinkButton } from "@/components/ui/link-button";
import { IconCheck, IconShieldCheck } from "@tabler/icons-react";

export default function Step2Form() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card/80 p-6 space-y-4 shadow-sm text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <IconCheck size={26} />
      </div>

      <div className="space-y-1">
        <p className="text-xl font-semibold">Password updated!</p>
        <p className="text-sm text-muted-foreground">
          Your password has been successfully reset. You can now use your new password to sign in.
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground flex items-center justify-center gap-2">
        <IconShieldCheck size={16} className="text-primary shrink-0" />
        <span>All previous sessions and devices have been securely signed out.</span>
      </div>

      <div className="pt-2">
        <LinkButton href="/login" className="w-full rounded-full text-base h-11">
          Back to login
        </LinkButton>
      </div>
    </div>
  );
}
