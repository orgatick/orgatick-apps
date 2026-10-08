import type { Metadata } from "next";
import { UnsubscribeView } from "./components/unsubscribe-view";

export const metadata: Metadata = {
  title: "Unsubscribe from Newsletter",
  description: "Manage your Orgatick newsletter email preferences and subscriptions.",
};

type SearchParams = Promise<{ token?: string }>;

export default async function UnsubscribePage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg min-h-[60vh] flex items-center justify-center">
      <UnsubscribeView token={token} />
    </div>
  );
}
