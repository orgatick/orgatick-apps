import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@orgatick/ui/components/card";
import { IconBuildingBank, IconHeadset, IconShieldCheck, IconTicket } from "@tabler/icons-react";

export function VerificationPerksCard() {
  const perks = [
    {
      icon: IconTicket,
      title: "Public Ticket Sales & Marketplace",
      desc: "Publish events to the public Orgatick marketplace and sell paid or free tickets without restriction.",
    },
    {
      icon: IconBuildingBank,
      title: "Automated Organizer Payouts",
      desc: "Connect your bank account and receive automated, verified payouts after each successful event.",
    },
    {
      icon: IconShieldCheck,
      title: "Verified Trust Badge",
      desc: "Display the official Orgatick verified checkmark on all event pages to maximize attendee confidence.",
    },
    {
      icon: IconHeadset,
      title: "Priority Support & Higher Limits",
      desc: "Access dedicated compliance and event support queues with elevated broadcast and attendee limits.",
    },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-base font-semibold">What Verification Unlocks</CardTitle>
        <CardDescription className="text-xs">
          Capabilities activated once your organization passes compliance review.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
        {perks.map((perk) => {
          const Icon = perk.icon;
          return (
            <div key={perk.title} className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/40 p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">{perk.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
