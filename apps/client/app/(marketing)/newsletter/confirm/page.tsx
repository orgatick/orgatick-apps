import type { Metadata } from "next";
import ConfirmSubscriptionView from "./components/confirm-subscription-view";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  description: "Confirm your email address to start receiving the Orgatick newsletter.",
  alternates: {
    canonical: "/newsletter/confirm",
  },
  // The page is only ever useful with a one-time token in the query string, so it must
  // never be indexed and must not leak a token through a referrer.
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ConfirmSubscriptionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-16">
      <ConfirmSubscriptionView token={token} />
    </div>
  );
}
