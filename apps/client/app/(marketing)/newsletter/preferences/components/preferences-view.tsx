"use client";

import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Checkbox } from "@orgatick/ui/components/checkbox";
import { Label } from "@orgatick/ui/components/label";
import { Switch } from "@orgatick/ui/components/switch";
import { IconCheck, IconMailCog, IconReload } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { fetchNewsletterPreferences, updateNewsletterPreferences } from "@/lib/apis/newsletter.api";

const TOPICS = [
  {
    id: "product",
    label: "Product Releases & Features",
    desc: "Major platform updates, ticket scanner tools, and feature announcements",
  },
  {
    id: "guides",
    label: "Organizer Playbooks & Best Practices",
    desc: "Tips on event marketing, pricing strategy, and attendee engagement",
  },
  {
    id: "community",
    label: "Community & Developer Updates",
    desc: "API releases, integrations, open source news, and local meetup alerts",
  },
];

export function PreferencesView({ token }: { token?: string }) {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [marketing, setMarketing] = useState(true);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchNewsletterPreferences(token)
      .then((res) => {
        setEmail(res.email);
        setCategories(res.preferences?.categories ?? []);
        setMarketing(res.preferences?.marketing ?? true);
      })
      .catch((err) => {
        console.error("Preferences error", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const toggleCategory = (id: string) => {
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleSave = () => {
    if (!token) return;
    startTransition(async () => {
      try {
        await updateNewsletterPreferences(token, { categories, marketing });
        setSaved(true);
        toast.success("Preferences updated successfully");
      } catch {
        toast.error("Failed to update preferences");
      }
    });
  };

  if (!token) {
    return (
      <Card className="max-w-md mx-auto text-center p-6 space-y-4">
        <IconMailCog className="size-10 text-muted-foreground mx-auto" />
        <CardTitle className="text-lg">Missing Token</CardTitle>
        <p className="text-xs text-muted-foreground">
          This preferences link is invalid. Please click the link directly from your email.
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
        <p className="text-sm font-medium">Loading your subscription details...</p>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto p-6 space-y-5">
      <CardHeader className="p-0 space-y-1">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <IconMailCog className="size-5 text-primary" />
          Email Preferences
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Managing notifications for <span className="font-semibold text-foreground">{email}</span>
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic Interests</p>
          {TOPICS.map((topic) => {
            const checked = categories.length === 0 || categories.includes(topic.id);
            return (
              <div
                key={topic.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/10 p-3 hover:bg-muted/20 transition-colors"
              >
                <Checkbox
                  id={`topic-${topic.id}`}
                  checked={checked}
                  onCheckedChange={() => toggleCategory(topic.id)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <Label htmlFor={`topic-${topic.id}`} className="text-xs font-medium cursor-pointer">
                    {topic.label}
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-normal">{topic.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border/40 pt-4 flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="marketing-toggle" className="text-xs font-medium">
              Promotional & Partner News
            </Label>
            <p className="text-[11px] text-muted-foreground">Receive occasional discounts and early invites</p>
          </div>
          <Switch id="marketing-toggle" checked={marketing} onCheckedChange={setMarketing} />
        </div>

        <div className="border-t border-border/40 pt-4 flex items-center justify-between">
          <Link
            href={`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Unsubscribe from all
          </Link>
          <Button disabled={pending} onClick={handleSave} size="sm">
            {pending ? (
              "Saving..."
            ) : saved ? (
              <span className="flex items-center gap-1">
                <IconCheck className="size-3.5" /> Saved
              </span>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
