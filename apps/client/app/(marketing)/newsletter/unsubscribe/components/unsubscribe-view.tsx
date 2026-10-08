"use client";

import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { IconAlertCircle, IconCheck, IconMail, IconMailOff, IconReload } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { resubscribeNewsletter, unsubscribeNewsletter } from "@/lib/apis/newsletter.api";

interface UnsubscribeViewProps {
  token?: string;
}

export function UnsubscribeView({ token }: UnsubscribeViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resubscribed, setResubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    unsubscribeNewsletter(token)
      .then((res) => {
        setEmail(res.email);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Invalid or expired unsubscribe link.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleResubscribe = () => {
    if (!token) return;
    startTransition(async () => {
      try {
        await resubscribeNewsletter(token);
        setResubscribed(true);
        toast.success("Welcome back! Your subscription is restored.");
      } catch {
        toast.error("Could not re-subscribe. Please try again.");
      }
    });
  };

  const handleFeedback = (reason: string) => {
    setFeedbackGiven(true);
    toast.success(`Thank you for your feedback: ${reason}`);
  };

  if (!token) {
    return (
      <Card className="max-w-md mx-auto text-center p-6 space-y-4">
        <IconMailOff className="size-10 text-muted-foreground mx-auto" />
        <CardTitle className="text-lg">Missing Unsubscribe Token</CardTitle>
        <p className="text-xs text-muted-foreground">
          This link appears to be invalid or incomplete. Please use the unsubscribe link provided at the bottom of your
          email.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm">
            Back to Home
          </Button>
        </Link>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="max-w-md mx-auto text-center p-8 space-y-3">
        <IconReload className="size-8 text-primary mx-auto animate-spin" />
        <p className="text-sm font-medium">Processing your request...</p>
        <p className="text-xs text-muted-foreground">Updating your email preferences securely.</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto text-center p-8 space-y-4 border-destructive/30">
        <IconAlertCircle className="size-10 text-destructive mx-auto" />
        <CardTitle className="text-lg">Unsubscribe Request Failed</CardTitle>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Link href="/">
          <Button variant="outline" size="sm">
            Back to Home
          </Button>
        </Link>
      </Card>
    );
  }

  if (resubscribed) {
    return (
      <Card className="max-w-md mx-auto text-center p-8 space-y-4 border-success/30 bg-success/5">
        <IconCheck className="size-10 text-success mx-auto" />
        <CardTitle className="text-xl">Subscription Restored</CardTitle>
        <p className="text-xs text-muted-foreground">
          {email
            ? `You're all set! ${email} will continue receiving our monthly updates.`
            : "You have been re-subscribed."}
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button size="sm">Return to Orgatick</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto p-6 space-y-5">
      <CardHeader className="p-0 text-center space-y-2">
        <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto">
          <IconMailOff className="size-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl font-bold">You have unsubscribed</CardTitle>
        <p className="text-xs text-muted-foreground">
          {email
            ? `${email} has been removed from our newsletter list.`
            : "You have been removed from our newsletter list."}
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-4 text-center">
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-medium">Unsubscribed by accident?</p>
          <Button size="sm" variant="outline" disabled={pending} onClick={handleResubscribe} className="w-full">
            <IconMail className="size-3.5" />
            {pending ? "Restoring..." : "Re-subscribe to Orgatick"}
          </Button>
        </div>

        {!feedbackGiven ? (
          <div className="space-y-2 pt-2 text-left">
            <p className="text-xs font-medium text-muted-foreground text-center">Help us improve. Why did you leave?</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {["Emails too frequent", "No longer relevant", "Never signed up", "Prefer RSS/Social"].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleFeedback(reason)}
                  className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Thank you for helping us improve!</p>
        )}

        <div className="pt-3 border-t border-border/40">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
