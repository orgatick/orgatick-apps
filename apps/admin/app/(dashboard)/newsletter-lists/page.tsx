import type { Metadata } from "next";
import { ListsClientView } from "@/components/newsletter/lists/lists-client-view";
import { serverFetchNewsletterLists } from "@/lib/newsletter.api";

export const metadata: Metadata = {
  title: "Mailing Lists | Admin",
  description: "Manage mailing lists, default fallbacks, and segmented audiences.",
};

export default async function MailingListsPage() {
  const lists = await serverFetchNewsletterLists();

  return (
    <div className="p-4 md:p-6">
      <ListsClientView lists={lists} />
    </div>
  );
}
