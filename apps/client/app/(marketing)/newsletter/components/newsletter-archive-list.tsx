import type { PublicNewsletterArchiveItem } from "@orgatick/contracts";
import { IconArrowRight, IconCalendar } from "@tabler/icons-react";
import Link from "next/link";

export function NewsletterArchiveList({ items }: { items: PublicNewsletterArchiveItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 p-8 text-center">
        <p className="text-sm font-medium text-foreground">First edition coming soon!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Subscribe above to receive our premier monthly issue directly in your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/newsletter/campaign/${item.id}`}
          className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <IconCalendar className="size-3" />
            {item.sentAt
              ? new Date(item.sentAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent edition"}
          </div>
          <h3 className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {item.subject}
          </h3>
          {item.previewText && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.previewText}</p>}
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
            Read edition <IconArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
