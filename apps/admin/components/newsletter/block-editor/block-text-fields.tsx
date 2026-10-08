import type { NewsletterLeafBlock } from "@orgatick/contracts";
import { Input } from "@orgatick/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Textarea } from "@orgatick/ui/components/textarea";
import { AlignPicker, Field } from "./block-common";

export function HeadingFields({
  block,
  patch,
}: {
  block: Extract<NewsletterLeafBlock, { type: "heading" }>;
  patch: (values: Partial<NewsletterLeafBlock>) => void;
}) {
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
        <Input value={block.text} onChange={(e) => patch({ text: e.target.value })} />
      </Field>
      <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
    </div>
  );
}

export function ParagraphFields({
  block,
  patch,
}: {
  block: Extract<NewsletterLeafBlock, { type: "paragraph" }>;
  patch: (values: Partial<NewsletterLeafBlock>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
      <Field label="Text" hint="Plain text. Supports merge tags such as {{ first_name }}.">
        <Textarea rows={4} value={block.text} onChange={(e) => patch({ text: e.target.value })} />
      </Field>
      <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
    </div>
  );
}

export function RichTextFields({
  block,
  patch,
}: {
  block: Extract<NewsletterLeafBlock, { type: "text" }>;
  patch: (values: Partial<NewsletterLeafBlock>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
      <Field label="Inline HTML" hint="Block level tags are stripped on render, so only inline markup is applied.">
        <Textarea
          rows={4}
          className="font-mono text-xs"
          value={block.html}
          onChange={(e) => patch({ html: e.target.value })}
        />
      </Field>
      <AlignPicker value={block.align} onChange={(align) => patch({ align })} />
    </div>
  );
}
