"use client";

import { NewsletterBlock, NewsletterLeafBlock } from "@orgatick/contracts";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Textarea } from "@orgatick/ui/components/textarea";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconColumns,
  IconCreditCard,
  IconHeading,
  IconSeparator,
  IconList,
  IconMinus,
  IconPhoto,
  IconPlus,
  IconQuote,
  IconTrash,
  IconTypography,
} from "@tabler/icons-react";
import { useState } from "react";
import { BlockPreview } from "@/components/newsletter/block-preview";

type Align = "left" | "center" | "right";

interface BlockEditorProps {
  value: NewsletterBlock[];
  onChange: (blocks: NewsletterBlock[]) => void;
  error?: string;
}

/** Defaults mirror the contract schema so every block is valid on the first save. */
const DEFAULTS: Record<
  "heading" | "paragraph" | "text" | "image" | "button" | "divider" | "spacer" | "list",
  NewsletterLeafBlock
> = {
  heading: { type: "heading", text: "A headline worth reading", level: "h2", align: "left" },
  paragraph: {
    type: "paragraph",
    text: "Explain what happened and why it matters for the reader in one or two sentences.",
    align: "left",
  },
  text: {
    type: "text",
    html: '<p>Rich text with <strong>bold</strong> and <a href="https://orgatick.in">links</a>.</p>',
    align: "left",
  },
  image: { type: "image", src: "https://placehold.co/1200x600", alt: "Campaign hero image", align: "center" },
  button: { type: "button", text: "Read more", href: "https://orgatick.in", variant: "solid", align: "left" },
  divider: { type: "divider" },
  spacer: { type: "spacer", size: "md" },
  list: { type: "list", style: "bullet", items: [{ text: "First point" }, { text: "Second point" }] },
};

const MENU_ITEMS = [
  { type: "heading", label: "Heading", icon: IconHeading },
  { type: "paragraph", label: "Paragraph", icon: IconTypography },
  { type: "text", label: "Rich text", icon: IconQuote },
  { type: "image", label: "Image", icon: IconPhoto },
  { type: "button", label: "Button", icon: IconCreditCard },
  { type: "list", label: "List", icon: IconList },
  { type: "divider", label: "Divider", icon: IconSeparator },
  { type: "spacer", label: "Spacer", icon: IconMinus },
  { type: "columns", label: "Columns", icon: IconColumns },
] as const;

export function BlockEditor({ value, onChange, error }: BlockEditorProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const replace = (index: number, block: NewsletterBlock) => {
    const next = [...value];
    next[index] = block;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, position) => position !== index));
    setExpanded(null);
  };

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [block] = next.splice(index, 1);
    next.splice(target, 0, block);
    onChange(next);
    setExpanded(target);
  };

  const addBlock = (type: (typeof MENU_ITEMS)[number]["type"]) => {
    const block: NewsletterBlock =
      type === "columns"
        ? { type: "columns", columns: [{ blocks: [DEFAULTS.paragraph] }, { blocks: [DEFAULTS.paragraph] }] }
        : { ...structuredClone(DEFAULTS[type]), id: `block-${crypto.randomUUID().slice(0, 8)}` };
    onChange([...value, block]);
    setExpanded(value.length);
  };

  return (
    <div className="space-y-3">
      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-foreground">No content blocks yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a heading and a paragraph to get started. Blocks render into email-safe HTML automatically.
          </p>
        </div>
      )}

      {value.map((block, index) => {
        const open = expanded === index;
        return (
          <div key={block.id ?? `${block.type}-${index}`} className="rounded-lg border border-border/60">
            <div className="flex items-center gap-2 border-b border-border/60 p-2">
              <Badge variant="secondary" className="font-mono text-[10px]">
                {block.type}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start px-1 text-xs text-muted-foreground"
                onClick={() => setExpanded(open ? null : index)}
              >
                <IconChevronDown
                  className={open ? "size-3.5 rotate-180 transition-transform" : "size-3.5 transition-transform"}
                />
                {open ? "Hide" : "Edit"}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move block up"
              >
                <IconArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label="Move block down"
              >
                <IconArrowDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label="Delete block"
                className="text-destructive hover:text-destructive"
              >
                <IconTrash className="size-4" />
              </Button>
            </div>

            <div className="space-y-4 p-4">
              <div className="rounded-md bg-muted/30 p-3">
                <BlockPreview block={block} />
              </div>

              {open &&
                (block.type === "columns" ? (
                  <ColumnsFields block={block} onChange={(next) => replace(index, next)} />
                ) : (
                  <LeafFields block={block} onChange={(next) => replace(index, next)} />
                ))}
            </div>
          </div>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm" className="w-full">
              <IconPlus className="size-4" />
              Add block
            </Button>
          }
        />
        <DropdownMenuContent className="w-56" align="start">
          {/* The label is a menu group part, so it needs the group it labels. */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Content blocks</DropdownMenuLabel>
            {MENU_ITEMS.map((item) => (
              <DropdownMenuItem key={item.type} onClick={() => addBlock(item.type)}>
                <item.icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AlignPicker({ value, onChange }: { value: Align; onChange: (align: Align) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Alignment</Label>
      <Select value={value} onValueChange={(next) => onChange(next as Align)}>
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function LeafFields({
  block,
  onChange,
}: {
  block: NewsletterLeafBlock;
  onChange: (block: NewsletterLeafBlock) => void;
}) {
  const patch = (values: Partial<NewsletterLeafBlock>) => onChange({ ...block, ...values } as NewsletterLeafBlock);

  switch (block.type) {
    case "heading":
      return (
        <div className="grid gap-3 sm:grid-cols-[110px_1fr_130px]">
          <Field label="Level">
            <Select value={block.level} onValueChange={(next) => patch({ level: next as "h1" })}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Text">
            <Input value={block.text} onChange={(event) => patch({ text: event.target.value })} />
          </Field>
          <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
        </div>
      );
    case "paragraph":
      return (
        <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
          <Field label="Text" hint="Plain text. Supports merge tags such as {{ first_name }}.">
            <Textarea rows={4} value={block.text} onChange={(event) => patch({ text: event.target.value })} />
          </Field>
          <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
        </div>
      );
    case "text":
      return (
        <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
          <Field label="Inline HTML" hint="Block level tags are stripped on render, so only inline markup is applied.">
            <Textarea
              rows={4}
              className="font-mono text-xs"
              value={block.html}
              onChange={(event) => patch({ html: event.target.value })}
            />
          </Field>
          <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
        </div>
      );
    case "image":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Image URL" hint="Use an absolute https URL. Width defaults to the content column.">
            <Input value={block.src} onChange={(event) => patch({ src: event.target.value })} />
          </Field>
          <Field label="Alt text" hint="Describe the image for screen readers. Leave empty for decorative images.">
            <Input value={block.alt} onChange={(event) => patch({ alt: event.target.value })} />
          </Field>
          <Field label="Link to (optional)">
            <Input
              value={block.href ?? ""}
              onChange={(event) => patch({ href: event.target.value || undefined })}
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
                onChange={(event) => patch({ width: event.target.value ? Number(event.target.value) : undefined })}
              />
            </Field>
            <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
          </div>
        </div>
      );
    case "button":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Label">
            <Input value={block.text} onChange={(event) => patch({ text: event.target.value })} />
          </Field>
          <Field label="Destination URL">
            <Input value={block.href} onChange={(event) => patch({ href: event.target.value })} />
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
    case "list":
      return (
        <div className="space-y-3">
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
                // biome-ignore lint/suspicious/noArrayIndexKey: list items are append/remove only, never reordered
                <div key={itemIndex} className="flex items-center gap-2">
                  <Input
                    value={item.text}
                    onChange={(event) => {
                      const items = [...block.items];
                      items[itemIndex] = { ...item, text: event.target.value };
                      patch({ items });
                    }}
                    aria-label={`List item ${itemIndex + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove list item"
                    onClick={() => patch({ items: block.items.filter((_, index) => index !== itemIndex) })}
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
        </div>
      );
    case "spacer":
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
    case "divider":
      return <p className="text-xs text-muted-foreground">A horizontal rule needs no further configuration.</p>;
  }
}

function ColumnsFields({
  block,
  onChange,
}: {
  block: Extract<NewsletterBlock, { type: "columns" }>;
  onChange: (block: Extract<NewsletterBlock, { type: "columns" }>) => void;
}) {
  const leafTypes = ["paragraph", "heading", "image", "button", "list"] as const;

  const setColumnCount = (count: number) => {
    const columns = Array.from(
      { length: count },
      (_, index) => block.columns[index] ?? { blocks: [{ ...structuredClone(DEFAULTS.paragraph) }] },
    );
    onChange({ ...block, columns });
  };

  return (
    <div className="space-y-4">
      <Field label="Column count">
        <Select value={String(block.columns.length)} onValueChange={(next) => setColumnCount(Number(next))}>
          <SelectTrigger size="sm" className="w-full max-w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Two columns</SelectItem>
            <SelectItem value="3">Three columns</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.columns.length}, minmax(0, 1fr))` }}>
        {block.columns.map((column, columnIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed 2-3 column array, no reorder control
          <div key={columnIndex} className="space-y-2 rounded-md border border-border/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Column {columnIndex + 1}
            </p>
            {column.blocks.map((leaf, leafIndex) => (
              <LeafFields
                key={leaf.id ?? leafIndex}
                block={leaf}
                onChange={(next) => {
                  const columns = [...block.columns];
                  const blocks = [...column.blocks];
                  blocks[leafIndex] = next;
                  columns[columnIndex] = { blocks };
                  onChange({ ...block, columns });
                }}
              />
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="w-full">
                    <IconPlus className="size-3.5" />
                    Add block
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                {leafTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => {
                      const columns = [...block.columns];
                      const blocks = [...column.blocks, structuredClone(DEFAULTS[type])];
                      columns[columnIndex] = { blocks };
                      onChange({ ...block, columns });
                    }}
                  >
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Columns collapse to full width on mobile. Columns hold leaf blocks only, so nested columns are not allowed.
      </p>
    </div>
  );
}
