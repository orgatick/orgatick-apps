import type { Metadata } from "next";
import { PreferencesView } from "./components/preferences-view";

export const metadata: Metadata = {
  title: "Manage Email Preferences",
  description: "Customize your newsletter frequency and topics on Orgatick.",
};

type SearchParams = Promise<{ token?: string }>;

export default async function PreferencesPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl min-h-[60vh] flex items-center justify-center">
      <PreferencesView token={token} />
    </div>
  );
}
