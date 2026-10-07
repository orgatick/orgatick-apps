import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { IconArrowUpRight, IconBuildingPlus, IconSettings, IconShieldCheck, IconUsers } from "@tabler/icons-react";
import Link from "next/link";

export function DashboardQuickActions() {
  const actions = [
    {
      title: "Team & Permissions",
      desc: "Invite teammates, manage roles, and review invitation status.",
      href: "/team",
      cta: "Manage Team",
      icon: IconUsers,
    },
    {
      title: "Organization Verification",
      desc: "Check verification progress and review compliance documents.",
      href: "/verification",
      cta: "View Verification",
      icon: IconShieldCheck,
    },
    {
      title: "Organization Settings",
      desc: "Update organization name, bio, official contact info, and preferences.",
      href: "/settings",
      cta: "Edit Settings",
      icon: IconSettings,
    },
    {
      title: "Create Another Org",
      desc: "Register a new organization workspace under your account.",
      href: "/create",
      cta: "Create Organization",
      icon: IconBuildingPlus,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Card
            key={act.title}
            className="rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <CardTitle className="text-base font-semibold">{act.title}</CardTitle>
              </div>
              <CardDescription className="text-xs pt-1">{act.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                render={<Link href={act.href} />}
                variant="outline"
                size="sm"
                className="gap-1.5 w-full sm:w-auto"
              >
                <span>{act.cta}</span>
                <IconArrowUpRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
