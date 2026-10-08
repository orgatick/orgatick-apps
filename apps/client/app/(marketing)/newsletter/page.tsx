import type { Metadata } from "next";
import { IconCheck, IconMail, IconSparkles } from "@tabler/icons-react";
import { fetchPublicCampaigns } from "@/lib/apis/newsletter.api";
import { NewsletterArchiveList } from "./components/newsletter-archive-list";
import { NewsletterHeroSignup } from "./components/newsletter-hero-signup";

export const metadata: Metadata = {
  title: "Orgatick Newsletter - Monthly Product & Organizer Insights",
  description:
    "Join event creators, organizers, and tech leaders receiving Orgatick's monthly digest of platform updates, product releases, and event industry playbooks.",
};

export default async function NewsletterLandingPage() {
  const archive = await fetchPublicCampaigns().catch(() => []);

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-4xl px-4 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <IconSparkles className="size-3.5" />
            Monthly Event Insights & Release Notes
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-heading">
            Stay ahead with Orgatick
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            The monthly email curated for event organizers, ticketing pros, and software builders. Feature drops, growth
            strategies, and zero fluff.
          </p>
        </div>

        {/* Signup Card */}
        <div className="max-w-xl mx-auto">
          <NewsletterHeroSignup />
        </div>

        {/* Value Pillars */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
          <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-2 text-center sm:text-left">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
              <IconCheck className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Strictly 1 Email/Month</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We respect your inbox. No daily blasts, marketing spam, or promotional noise.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-2 text-center sm:text-left">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
              <IconSparkles className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Practical Playbooks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated tips from top organizers on ticket pricing, attendance, and scanner setups.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-2 text-center sm:text-left">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
              <IconMail className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">1-Click Control</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Customize topics or unsubscribe at any time directly from the footer of any email.
            </p>
          </div>
        </div>

        {/* Past Editions / Archive */}
        <div className="space-y-6 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">Recent Editions</h2>
            <p className="text-xs text-muted-foreground">
              Browse previous issues and see what we share with our community.
            </p>
          </div>

          <NewsletterArchiveList items={archive} />
        </div>
      </div>
    </div>
  );
}
