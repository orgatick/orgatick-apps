"use client";

import { Input } from "@orgatick/ui/components/input";
import { InputGroup, InputGroupButton, InputGroupInput } from "@orgatick/ui/components/input-group";
import { Skeleton } from "@orgatick/ui/components/skeleton";
import { IconArrowRight, IconBrandMailgun } from "@tabler/icons-react";
import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/(auth)/_store";
import { handleApiError } from "@/lib/apis/api-error";
import { fetchNewsletterSubscription, subscribeNewsletter } from "@/lib/apis/newsletter.api";

/** Where the footer stands for the signed-in address. `unknown` is only for the first render. */
type SubscriptionState = "unknown" | "checking" | "subscribed" | "not-subscribed";

/**
 * Footer newsletter signup.
 *
 * Posts to the public double opt-in endpoint, so the success copy always points at the
 * inbox rather than promising an immediate subscription. Signed-in visitors are asked
 * whether they are already subscribed so they are not offered a signup they do not need.
 */
export function NewsletterSignupForm() {
  const { user, isInitialized } = useAuthStore();
  const emailId = useId();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [honeypot, setHoneypot] = useState("");
  const [doneFor, setDoneFor] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>("unknown");
  const [pending, startTransition] = useTransition();

  const signedInAs = user?.email;
  /**
   * Who the confirmation message belongs to. Because it is derived rather than a flag that has to
   * be reset, the message disappears on its own when the signed-in address changes hands, with no
   * state update during render and no effect that has to notice the change.
   */
  const addressKey = signedInAs ?? "signed-out-visitor";
  const done = doneFor === addressKey;

  // The request, its stale-answer guard and its abort all live in the effect, so the dependency
  // list is the whole story: run once per address, once more when auth has finished resolving.
  useEffect(() => {
    if (!signedInAs) {
      // Nobody is signed in: the form is the default and there is nothing to check.
      setSubscription("not-subscribed");
      return;
    }

    if (!isInitialized) {
      // Auth has not finished loading, so the address may still change hands.
      setSubscription("checking");
      return;
    }

    const controller = new AbortController();
    setSubscription("checking");
    console.log("checking newsletter subscription for", signedInAs);

    fetchNewsletterSubscription()
      .then((isSubscribed) => {
        setSubscription(isSubscribed ? "subscribed" : "not-subscribed");
      })
      .catch((error: unknown) => {
        // A failed probe must never block signing up, so fall through to the form.
        if (controller.signal.aborted) return;
        console.warn("Newsletter subscription check failed, showing the signup form", error);
        setSubscription("not-subscribed");
      });

    console.log("newsletter subscription check completed for", signedInAs);

    return () => controller.abort();
  }, [signedInAs, isInitialized]);

  // Prefill only what is still empty, so an address or name typed by hand is never overwritten.
  useEffect(() => {
    setEmail((current) => (current.trim() ? current : (signedInAs ?? "")));
    setName((current) => (current.trim() ? current : (user?.name ?? "")));
  }, [signedInAs, user?.name]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const result = await subscribeNewsletter({
          email: email.trim(),
          name: name.trim() || undefined,
          source: "footer",
          website: honeypot || undefined,
        });
        setDoneFor(addressKey);
        setEmail("");
        setName("");
        toast.success(result.message);
      } catch (error) {
        handleApiError(error, "Could not subscribe right now");
      }
    });
  };

  return (
    <div className="col-span-2 space-y-3">
      <p className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
        <IconBrandMailgun className="size-4" />
        Product updates, monthly
      </p>

      {done ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Thanks for subscribing. Check your inbox to confirm the address, then you are in.
        </p>
      ) : subscription === "subscribed" ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          This address is subscribed. Every email we send carries a link to pause or change what you receive.
        </p>
      ) : subscription === "checking" ? (
        // Same two blocks as the form, so swapping to it does not shift the footer.
        <div aria-busy="true" className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-9 w-full" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            One email a month. Unsubscribe anytime from any email we send.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          {/* Own field above the group, so it stays put while it is being typed into. */}
          {email.trim().length > 0 && (
            <>
              <label htmlFor={`${emailId}-name`} className="sr-only">
                First name (optional)
              </label>
              <Input
                id={`${emailId}-name`}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="First name (optional)"
                className="bg-background"
              />
            </>
          )}

          <InputGroup>
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <InputGroupInput
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <InputGroupButton type="submit" variant="secondary" disabled={pending || !email.trim()}>
              {pending ? "Subscribing" : "Subscribe"}
              <IconArrowRight className="size-3.5" />
            </InputGroupButton>
          </InputGroup>

          {/* Honeypot: kept off screen and out of the tab order, but bots still fill it in. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={`${emailId}-website`}>Website</label>
            <input
              id={`${emailId}-website`}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            One email a month. Unsubscribe anytime from any email we send.
          </p>
        </form>
      )}
    </div>
  );
}
