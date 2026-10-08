import type { NewsletterListResponse, NewsletterTemplateResponse } from "@orgatick/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";

interface CampaignMetadataCardProps {
  name: string;
  subject: string;
  previewText: string;
  listId: string;
  templateId: string;
  lists: NewsletterListResponse[];
  templates: NewsletterTemplateResponse[];
  onChange: (patch: Record<string, string>) => void;
  onTemplateChange: (templateId: string) => void;
}

export function CampaignMetadataCard({
  name,
  subject,
  previewText,
  listId,
  templateId,
  lists,
  templates,
  onChange,
  onTemplateChange,
}: CampaignMetadataCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Campaign Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="camp-subject" className="text-xs">
              Subject Line *
            </Label>
            <Input
              id="camp-subject"
              value={subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="e.g. October Product Update & Feature Drops"
              maxLength={200}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Opens depend on a clear, punchy subject</span>
              <span>{subject.length}/200</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="camp-preview" className="text-xs">
              Preview Text (Preheader)
            </Label>
            <Input
              id="camp-preview"
              value={previewText}
              onChange={(e) => onChange({ previewText: e.target.value })}
              placeholder="e.g. Inside: New ticket QR scanner, analytics v2..."
              maxLength={300}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Shows next to subject in email client</span>
              <span>{previewText.length}/300</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="camp-name" className="text-xs">
              Internal Name
            </Label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Defaults to subject"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Mailing List *</Label>
            <Select value={listId} onValueChange={(val) => onChange({ listId: val ?? "" })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select audience list" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name} ({l.subscriberCount} subscribers)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Apply Template</Label>
            <Select value={templateId} onValueChange={(val) => onTemplateChange(val ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="None (Blank draft)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Blank draft)</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
