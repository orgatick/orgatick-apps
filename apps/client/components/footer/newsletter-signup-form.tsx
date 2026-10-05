"use client";

import { Input } from "@orgatick/ui/components/input";
import { InputGroup, InputGroupButton, InputGroupInput } from "@orgatick/ui/components/input-group";
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
