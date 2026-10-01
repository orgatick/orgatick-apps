import type { NewsletterBlock, NewsletterLeafBlock } from "@orgatick/contracts";

/**
 * Read-only rendering of a content block.
 *
 * Mirrors the block structure of the editor so an admin can review exactly what will be
 * sent without opening the preview iframe.
 */
export function BlockPreview({ block }: { block: NewsletterBlock }) {
  if (block.type === "columns") {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.columns.length}, minmax(0, 1fr))` }}>
        {block.columns.map((column, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: read-only preview, columns are never reordered
          <div key={index} className="space-y-2 rounded-md bg-muted/40 p-2">
            {column.blocks.map((child, childIndex) => (
              <BlockPreview key={child.id ?? childIndex} block={child} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return <LeafPreview block={block} />;
}

function LeafPreview({ block }: { block: NewsletterLeafBlock }) {
  switch (block.type) {
    case "heading":
      return <p className={headingClass(block.level)}>{block.text}</p>;
    case "paragraph":
      return <p className="text-sm leading-relaxed text-foreground/90">{block.text}</p>;
    case "text":
      return (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: admin-only preview of contract-validated inline HTML
        <p className="text-sm leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: block.html }} />
      );
    case "image":
      return (
        <figure className="space-y-1">
          {/* Remote images are proxied through the browser, so a plain img is correct here. */}
          {/* biome-ignore lint/performance/noImgElement: admin preview of a remote asset */}
          <img src={block.src} alt={block.alt} className="max-h-40 rounded-md border border-border/60 object-contain" />
          {block.alt && <figcaption className="text-xs text-muted-foreground">{block.alt}</figcaption>}
        </figure>
      );
    case "button":
      return (
        <span
          className={
            block.variant === "outline"
              ? "inline-flex rounded-md border border-primary px-3 py-1.5 text-xs font-semibold text-primary"
              : "inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          }
        >
          {block.text}
        </span>
      );
    case "divider":
      return <hr className="border-border/60" />;
    case "spacer":
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div aria-hidden="true" className="h-6 flex-1 rounded-md border border-dashed border-border/60" />
          {block.size} spacer
        </div>
      );
    case "list":
      return block.style === "number" ? (
        <ol className="list-decimal space-y-1 ps-5 text-sm text-foreground/90">
          {block.items.map((item) => (
            <li key={item.text}>{item.text}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-1 ps-5 text-sm text-foreground/90">
          {block.items.map((item) => (
            <li key={item.text}>{item.text}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function headingClass(level: "h1" | "h2" | "h3"): string {
  if (level === "h1") return "text-xl font-bold text-foreground";
  if (level === "h3") return "text-sm font-semibold text-foreground";
  return "text-base font-semibold text-foreground";
}
