import type { NewsletterBlock, NewsletterLeafBlock } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { IconPlus } from "@tabler/icons-react";
import { Field } from "./block-common";
import { DEFAULTS } from "./block-editor-types";
import { HeadingFields, ParagraphFields, RichTextFields } from "./block-text-fields";
import { ButtonFields, ImageFields, ListFields, SpacerFields } from "./block-media-fields";

export function LeafFields({
  block,
  onChange,
}: {
  block: NewsletterLeafBlock;
  onChange: (block: NewsletterLeafBlock) => void;
}) {
  const patch = (values: Partial<NewsletterLeafBlock>) => onChange({ ...block, ...values } as NewsletterLeafBlock);

  switch (block.type) {
    case "heading":
      return <HeadingFields block={block} patch={patch} />;
    case "paragraph":
      return <ParagraphFields block={block} patch={patch} />;
    case "text":
      return <RichTextFields block={block} patch={patch} />;
    case "image":
      return <ImageFields block={block} patch={patch} />;
    case "button":
      return <ButtonFields block={block} patch={patch} />;
    case "list":
      return <ListFields block={block} patch={patch} />;
    case "spacer":
      return <SpacerFields block={block} patch={patch} />;
    case "divider":
      return <p className="text-xs text-muted-foreground">A horizontal rule needs no further configuration.</p>;
    default:
      return null;
  }
}

export function ColumnsFields({
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
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed column layout
          <div key={`col-${columnIndex}`} className="space-y-2 rounded-md border border-border/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Column {columnIndex + 1}
            </p>
            {column.blocks.map((leaf, leafIndex) => (
              <LeafFields
                // biome-ignore lint/suspicious/noArrayIndexKey: order-dependent sub-blocks
                key={`leaf-${leafIndex}`}
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
    </div>
  );
}
