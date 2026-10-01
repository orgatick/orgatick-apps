import type { Metadata } from "next";
import { CampaignComposer } from "@/components/newsletter/campaign-composer";
import { PageHeader } from "@/components/page-header";
import { serverFetchActiveTemplates, serverFetchNewsletterLists } from "@/lib/newsletter.api";

export const metadata: Metadata = { title: "New campaign" };

export default async function NewCampaignPage() {
  const [lists, templates] = await Promise.all([serverFetchNewsletterLists(), serverFetchActiveTemplates()]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="New campaign"
        description="Compose blocks, pick the audience, then save a draft or send immediately."
      />
      <CampaignComposer lists={lists} templates={templates} />
    </div>
  );
}
