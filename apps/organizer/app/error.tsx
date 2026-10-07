"use client";

import { LinkButton } from "@/components/ui/link-button";
import ServerError500 from "@orgatick/ui/assets/illustration/server-error";
import { Button } from "@orgatick/ui/components/button";
import { IconCheck, IconCopy, IconHome, IconRefresh } from "@tabler/icons-react";
import * as motion from "motion/react-client";
import { useEffect, useState } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  const handleCopyDigest = () => {
    if (error.digest) {
      navigator.clipboard.writeText(error.digest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setIsRetrying(true);
    reset();
    setTimeout(() => setIsRetrying(false), 800);
  };

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-background text-foreground">
      <motion.div
        className="relative z-10 flex max-w-lg w-full flex-col items-center text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="mb-6 w-full max-w-[260px] sm:max-w-[300px]">
          <ServerError500 className="w-full h-auto" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-destructive">
          An unexpected error occurred
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-md">
          A temporary glitch occurred while processing your request. Please try refreshing or return to the dashboard.
        </p>

        {error.digest && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground font-mono shadow-xs">
            <span className="text-muted-foreground/70">Ref:</span>
            <span className="text-foreground select-all">{error.digest}</span>
            <button
              type="button"
              onClick={handleCopyDigest}
              className="ml-1 rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy Reference ID"
            >
              {copied ? <IconCheck className="size-3.5 text-primary" /> : <IconCopy className="size-3.5" />}
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleReset}
            disabled={isRetrying}
            size="lg"
            className="w-full sm:w-auto px-6 font-medium shadow-xs"
          >
            <IconRefresh className={`mr-2 size-4 ${isRetrying ? "animate-spin" : ""}`} />
            Try again
          </Button>

          <LinkButton
            href="/"
            variant="outline"
            size="lg"
            icon={<IconHome className="mr-2 size-4" />}
            className="w-full sm:w-auto px-6 font-medium"
          >
            Go to dashboard
          </LinkButton>
        </div>
      </motion.div>
    </div>
  );
}
