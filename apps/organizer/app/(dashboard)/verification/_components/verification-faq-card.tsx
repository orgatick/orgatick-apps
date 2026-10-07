import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { IconClock, IconHelpCircle, IconLock, IconUserCheck } from "@tabler/icons-react";

export function VerificationFaqCard() {
  const faqs = [
    {
      icon: IconClock,
      title: "How long does review take?",
      desc: "Most requests are reviewed within 1–2 business days. You'll receive an email notification as soon as a decision is made.",
    },
    {
      icon: IconUserCheck,
      title: "Who can request verification?",
      desc: "For security reasons, only organization Owners and Administrators can submit or resubmit verification requests.",
    },
    {
      icon: IconLock,
      title: "Is my business data secure?",
      desc: "All submitted business and personal details are encrypted at rest and in transit. Information is solely used for compliance validation.",
    },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <IconHelpCircle className="size-4 text-primary" />
          Review Guidelines & FAQ
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {faqs.map((faq) => {
          const Icon = faq.icon;
          return (
            <div key={faq.title} className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{faq.title}</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed ps-5">{faq.desc}</p>
            </div>
          );
        })}

        <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Need help with verification?</p>
          <p className="text-[11px] mt-0.5">
            Contact our compliance team at{" "}
            <a href="mailto:support@orgatick.com" className="text-primary hover:underline font-medium">
              support@orgatick.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
