import type { NewsletterListResponse } from "@orgatick/contracts";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { IconAddressBook, IconCircleCheck, IconList, IconUsers } from "@tabler/icons-react";

interface ListsHeaderStatsProps {
  lists: NewsletterListResponse[];
}

export function ListsHeaderStats({ lists }: ListsHeaderStatsProps) {
  const totalLists = lists.length;
  const activeLists = lists.filter((l) => l.isActive).length;
  const totalSubscribers = lists.reduce((sum, l) => sum + (l.subscriberCount || 0), 0);
  const defaultList = lists.find((l) => l.isDefault);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total Lists
            </span>
            <IconList className="size-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{totalLists}</p>
          <p className="text-xs text-muted-foreground">Mailing segments</p>
        </CardContent>
      </Card>

      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Active Lists
            </span>
            <IconCircleCheck className="size-4 text-success" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{activeLists}</p>
          <p className="text-xs text-muted-foreground">Accepting signups</p>
        </CardContent>
      </Card>

      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total Audience
            </span>
            <IconUsers className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalSubscribers.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Across all lists</p>
        </CardContent>
      </Card>

      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Default List
            </span>
            <IconAddressBook className="size-4 text-muted-foreground" />
          </div>
          <p className="truncate text-base font-bold tracking-tight text-foreground pt-1">
            {defaultList ? defaultList.name : "None assigned"}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {defaultList ? `/${defaultList.slug}` : "Select default below"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
