import type { Metadata } from "next";
import InvitationView from "./components/invitation-view";

export const metadata: Metadata = {
  title: "Organization invitation",
  description: "Accept or decline an invitation to join an organization on Orgatick.",
  // The page holds a bearer token in the URL, so it must never be indexed and must
  // not leak the token through a referrer.
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-16">
      <InvitationView token={token} />
    </div>
  );
}
