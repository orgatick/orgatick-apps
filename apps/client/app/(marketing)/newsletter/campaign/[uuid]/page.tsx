import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@orgatick/ui/components/button";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";
import type { PublicNewsletterCampaignResponse } from "@orgatick/contracts";
import { fetchPublicCampaign } from "@/lib/apis/newsletter.api";

interface CampaignPageProps {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const campaign = await fetchPublicCampaign(uuid);
    return {
      title: `${campaign.subject} - Orgatick Newsletter`,
      description: campaign.previewText || `Read the latest update from ${campaign.fromName}.`,
    };
  } catch {
    return { title: "Campaign - Orgatick" };
  }
}

export default async function PublicCampaignPage({ params }: CampaignPageProps) {
  const { uuid } = await params;

  let campaign: PublicNewsletterCampaignResponse;
  try {
    campaign = await fetchPublicCampaign(uuid);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/newsletter"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft className="size-3.5" />
            All Newsletters
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/newsletter">
              <Button size="sm" variant="secondary" className="text-xs h-8">
                <IconMail className="size-3.5" />
                Subscribe to Newsletter
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 pt-8">
        <div className="mb-6 space-y-2 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{campaign.fromName}</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{campaign.subject}</h1>
          {campaign.previewText && <p className="text-sm text-muted-foreground">{campaign.previewText}</p>}
          {campaign.sentAt && (
            <p className="text-xs text-muted-foreground pt-1">
              Sent on{" "}
              {new Date(campaign.sentAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-8 shadow-sm">
          <div
            className="prose prose-sm dark:prose-invert max-w-none newsletter-content"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized server-side HTML preview
            dangerouslySetInnerHTML={{ __html: campaign.html }}
          />
        </div>

        <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
          <p className="font-heading font-semibold text-foreground">Enjoyed this update?</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Get future editions directly in your inbox. No spam, one email a month, unsubscribe anytime.
          </p>
          <div>
            <Link href="/newsletter">
              <Button size="sm">Join the Orgatick Newsletter</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
