import { NewsletterSubscriberStatus, type BulkSubscriberActionDto } from "@orgatick/contracts";
import type { NewsletterSubscriberRepository } from "../repositories/newsletter-subscriber.repository";

export async function executeBulkSubscriberAction(
  repo: NewsletterSubscriberRepository,
  dto: BulkSubscriberActionDto,
): Promise<{ modified: number }> {
  let modified = 0;
  for (const rawId of dto.subscriberIds) {
    try {
      const id = BigInt(rawId);
      if (dto.action === "delete") {
        await repo.remove(id);
        modified++;
      } else if (dto.action === "unsubscribe") {
        const sub = await repo.findById(id);
        if (sub) {
          sub.status = NewsletterSubscriberStatus.UNSUBSCRIBED;
          sub.unsubscribedAt = new Date();
          await repo.save(sub);
          modified++;
        }
      } else if (dto.action === "resubscribe") {
        const sub = await repo.findById(id);
        if (sub) {
          sub.status = NewsletterSubscriberStatus.SUBSCRIBED;
          sub.confirmedAt = sub.confirmedAt ?? new Date();
          sub.unsubscribedAt = null;
          await repo.save(sub);
          modified++;
        }
      }
    } catch {
      // skip invalid id
    }
  }
  return { modified };
}

export async function generateSubscribersCsv(repo: NewsletterSubscriberRepository, listId?: string): Promise<string> {
  const [subscribers] = await repo.findPaginated({
    page: 1,
    limit: 10000,
    listId,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const headers = "id,email,name,status,source,subscribedAt,confirmedAt\n";
  const rows = subscribers
    .map(
      (s) =>
        `"${s.id}","${s.email}","${s.name || ""}","${s.status}","${s.source}","${s.subscribedAt ? s.subscribedAt.toISOString() : ""}","${s.confirmedAt ? s.confirmedAt.toISOString() : ""}"`,
    )
    .join("\n");

  return headers + rows;
}
