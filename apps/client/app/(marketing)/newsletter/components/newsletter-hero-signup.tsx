"use client";

import { Button } from "@orgatick/ui/components/button";
import { Checkbox } from "@orgatick/ui/components/checkbox";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { IconArrowRight, IconCheck, IconMail } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { subscribeNewsletter } from "@/lib/apis/newsletter.api";

const TOPIC_OPTIONS = [
  { id: "product", label: "Product & scanner updates" },
  { id: "guides", label: "Organizer growth playbooks" },
  { id: "community", label: "Developer & ecosystem news" },
];

export function NewsletterHeroSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["product", "guides"]);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    startTransition(async () => {
      try {
        const result = await subscribeNewsletter({
          email: email.trim(),
          name: name.trim() || undefined,
          source: "landing_page",
          preferences: {
            categories: selectedTopics,
            marketing: true,
          },
        });
        setSubmitted(true);
        toast.success(result.message);
      } catch (err) {
        handleApiError(err, "Subscription failed. Please try again.");
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center space-y-3">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <IconCheck className="size-6" />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">Confirm your email address</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          We just sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Please
          click the link to activate your subscription.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-xs">
            Your Email Address *
          </Label>
          <Input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-name" className="text-xs">
            Your First Name
          </Label>
          <Input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <p className="text-xs font-medium text-muted-foreground">What topics interest you?</p>
        <div className="flex flex-wrap gap-3">
          {TOPIC_OPTIONS.map((topic) => (
            <label
              key={topic.id}
              htmlFor={`topic-${topic.id}`}
              className="flex items-center gap-2 text-xs cursor-pointer select-none"
            >
              <Checkbox
                id={`topic-${topic.id}`}
                checked={selectedTopics.includes(topic.id)}
                onCheckedChange={() => toggleTopic(topic.id)}
              />
              <span>{topic.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pending || !email.trim()} className="w-full gap-2">
        <IconMail className="size-4" />
        {pending ? "Subscribing..." : "Subscribe to Orgatick Newsletter"}
        <IconArrowRight className="size-3.5" />
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Zero spam. Strictly 1 digest per month. Unsubscribe anytime with one click.
      </p>
    </form>
  );
}
