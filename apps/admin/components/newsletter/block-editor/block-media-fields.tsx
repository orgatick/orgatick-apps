import type { NewsletterLeafBlock } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { Input } from "@orgatick/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { AlignPicker, Field } from "./block-common";

export function ImageFields({
  block,
  patch,
}: {
  block: Extract<NewsletterLeafBlock, { type: "image" }>;
  patch: (values: Partial<NewsletterLeafBlock>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Image URL" hint="Use an absolute https URL.">
        <Input value={block.src} onChange={(e) => patch({ src: e.target.value })} />
      </Field>
      <Field label="Alt text" hint="Describe for accessibility.">
        <Input value={block.alt} onChange={(e) => patch({ alt: e.target.value })} />
      </Field>
      <Field label="Link to (optional)">
        <Input
          value={block.href ?? ""}
          onChange={(e) => patch({ href: e.target.value || undefined })}
          placeholder="https://"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Width (px)">
          <Input
            type="number"
            min={40}
            max={1200}
            value={block.width ?? ""}
            onChange={(e) => patch({ width: e.target.value ? Number(e.target.value) : undefined })}
          />
        </Field>
        <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
      </div>
    </div>
  );
}

export function ButtonFields({
  block,
  patch,
}: {
  block: Extract<NewsletterLeafBlock, { type: "button" }>;
  patch: (values: Partial<NewsletterLeafBlock>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Label">
        <Input value={block.text} onChange={(e) => patch({ text: e.target.value })} />
      </Field>
      <Field label="Destination URL">
        <Input value={block.href} onChange={(e) => patch({ href: e.target.value })} />
      </Field>
      <Field label="Style">
        <Select value={block.variant} onValueChange={(next) => patch({ variant: next as "solid" })}>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
    </div>
  );
}

export function ListFields({
  block,
  patch,
}: {
  block: Extract<NewsletterLeafBlock, { type: "list" }>;
  patch: (values: Partial<NewsletterLeafBlock>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
      <Field label="Style">
        <Select value={block.style} onValueChange={(next) => patch({ style: next as "bullet" })}>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bullet">Bulleted</SelectItem>
            <SelectItem value="number">Numbered</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="space-y-2">
        {block.items.map((item, itemIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: order-dependent list item
          <div key={`item-${itemIndex}`} className="flex items-center gap-2">
            <Input
              value={item.text}
              onChange={(e) => {
                const items = [...block.items];
                items[itemIndex] = { ...item, text: e.target.value };
                patch({ items });
              }}
              aria-label={`List item ${itemIndex + 1}`}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove list item"
              onClick={() => patch({ items: block.items.filter((_, idx) => idx !== itemIndex) })}
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          disabled={block.items.length >= 30}
          onClick={() => patch({ items: [...block.items, { text: "New point" }] })}
        >
          <IconPlus className="size-3.5" />
          Add item
        </Button>
      </div>
    </div>
  );
}

export function SpacerFields({
  block,
  patch,
}: {
  block: Extract<NewsletterLeafBlock, { type: "spacer" }>;
  patch: (values: Partial<NewsletterLeafBlock>) => void;
}) {
  return (
    <Field label="Height">
      <Select value={block.size} onValueChange={(next) => patch({ size: next as "sm" })}>
        <SelectTrigger size="sm" className="w-full max-w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sm">Small</SelectItem>
          <SelectItem value="md">Medium</SelectItem>
          <SelectItem value="lg">Large</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}
