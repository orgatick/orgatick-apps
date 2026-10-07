import { Card, CardContent } from "@orgatick/ui/components/card";
import { IconCategory, IconMail, IconShieldCheck, IconUsers } from "@tabler/icons-react";

interface OverviewCardsProps {
  categoryName?: string;
  email?: string | null;
  totalMembers?: number;
  isVerified: boolean;
}

export function DashboardOverviewCards({ categoryName, email, totalMembers = 1, isVerified }: OverviewCardsProps) {
  const cards = [
    {
      label: "Team Members",
      value: `${totalMembers} Active`,
      icon: IconUsers,
      desc: "Collaborators & roles",
    },
    {
      label: "Verification Status",
      value: isVerified ? "Approved" : "Under Review",
      icon: IconShieldCheck,
      desc: isVerified ? "Official trust badge enabled" : "Pending document review",
    },
    {
      label: "Industry & Category",
      value: categoryName || "Uncategorized",
      icon: IconCategory,
      desc: "Primary event niche",
    },
    {
      label: "Official Contact",
      value: email || "Not configured",
      icon: IconMail,
      desc: "Public correspondence",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="rounded-xl border border-border/60 bg-card p-4">
            <CardContent className="p-0 flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                  {item.label}
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-foreground truncate">{item.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground/80 truncate">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
