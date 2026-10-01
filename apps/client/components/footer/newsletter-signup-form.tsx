"use client";

import { Button } from "@orgatick/ui/components/button";
import { IconArrowRight, IconBrandMailgun } from "@tabler/icons-react";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { subscribeNewsletter } from "@/lib/apis/newsletter.api";

/**
 * Footer newsletter signup.
 *
 * Posts to the public double opt-in endpoint, so the success copy always points at the
 * inbox rather than promising an immediate subscription.
 */
export function NewsletterSignupForm() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

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
        setDone(true);
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
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:max-w-[220px]"
            />
            <Button type="submit" size="sm" disabled={pending || !email.trim()} className="shrink-0">
              {pending ? "Subscribing" : "Subscribe"}
              <IconArrowRight className="size-3.5" />
            </Button>
          </div>

          <label htmlFor={`${emailId}-name`} className="sr-only">
            First name (optional)
          </label>
          <input
            id={`${emailId}-name`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="First name (optional)"
            className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:max-w-[220px]"
          />

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
