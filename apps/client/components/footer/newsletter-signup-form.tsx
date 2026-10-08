"use client";

import { InputGroup, InputGroupButton, InputGroupInput } from "@orgatick/ui/components/input-group";
import { Skeleton } from "@orgatick/ui/components/skeleton";
import { IconArrowRight, IconCheck, IconMail, IconMailCheck } from "@tabler/icons-react";
import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/(auth)/_store";
import { handleApiError } from "@/lib/apis/api-error";
import { fetchNewsletterSubscription, subscribeNewsletter } from "@/lib/apis/newsletter.api";

type SubscriptionState = "unknown" | "checking" | "subscribed" | "not-subscribed";

export function NewsletterSignupForm() {
  const { user, isInitialized } = useAuthStore();
  const emailId = useId();
  const [email, setEmail] = useState(user?.email || "");
  const [honeypot, setHoneypot] = useState("");
  const [doneFor, setDoneFor] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>("unknown");
  const [pending, startTransition] = useTransition();

  const signedInAs = user?.email;
  const addressKey = signedInAs ?? "signed-out-visitor";
  const done = doneFor === addressKey;

  useEffect(() => {
    if (!signedInAs) {
      setSubscription("not-subscribed");
      return;
    }
    if (!isInitialized) {
      setSubscription("checking");
      return;
    }

    const controller = new AbortController();
    setSubscription("checking");

    fetchNewsletterSubscription()
      .then((isSubscribed) => {
        setSubscription(isSubscribed ? "subscribed" : "not-subscribed");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSubscription("not-subscribed");
        }
      });

    return () => controller.abort();
  }, [signedInAs, isInitialized]);

  useEffect(() => {
    setEmail((current) => (current.trim() ? current : (signedInAs ?? "")));
  }, [signedInAs]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    startTransition(async () => {
      try {
        const result = await subscribeNewsletter({
          email: email.trim(),
          name: user?.name?.trim() || undefined,
          source: "footer",
          website: honeypot || undefined,
        });
        setDoneFor(addressKey);
        setEmail("");
        toast.success(result.message);
      } catch (error) {
        handleApiError(error, "Could not subscribe right now");
      }
    });
  };

  return (
    <div className="col-span-2 space-y-3">
      <p className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
        <IconMail className="size-4 text-primary" />
        Product updates & insights
      </p>

      {done ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground flex items-start gap-2.5">
          <IconCheck className="size-4 shrink-0 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Check your inbox to confirm</p>
            <p className="mt-0.5">We sent a verification link to activate your subscription.</p>
          </div>
        </div>
      ) : subscription === "subscribed" ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconMailCheck className="size-4 text-success shrink-0" />
          <span>You are subscribed to monthly updates.</span>
        </div>
      ) : subscription === "checking" ? (
        <div aria-busy="true" className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <p className="text-[11px] text-muted-foreground">Checking subscription status...</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <InputGroup>
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <InputGroupInput
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <InputGroupButton type="submit" variant="secondary" disabled={pending || !email.trim()}>
              {pending ? "Subscribing..." : "Subscribe"}
              <IconArrowRight className="size-3.5" />
            </InputGroupButton>
          </InputGroup>

          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={`${emailId}-website`}>Website</label>
            <input
              id={`${emailId}-website`}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Zero spam. 1 email per month. Unsubscribe anytime with 1 click.
          </p>
        </form>
      )}
    </div>
  );
}
