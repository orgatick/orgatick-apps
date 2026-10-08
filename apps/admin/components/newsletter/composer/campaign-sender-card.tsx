import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Switch } from "@orgatick/ui/components/switch";

interface CampaignSenderCardProps {
  fromName: string;
  fromEmail: string;
  replyTo: string;
  limit: string;
  onlyRegisteredUsers: boolean;
  onChange: (patch: Record<string, string | boolean>) => void;
}

export function CampaignSenderCard({
  fromName,
  fromEmail,
  replyTo,
  limit,
  onlyRegisteredUsers,
  onChange,
}: CampaignSenderCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Sender & Audience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="camp-from-name" className="text-xs">
              From Name *
            </Label>
            <Input
              id="camp-from-name"
              value={fromName}
              onChange={(e) => onChange({ fromName: e.target.value })}
              placeholder="e.g. Orgatick Team"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="camp-from-email" className="text-xs">
              From Email *
            </Label>
            <Input
              id="camp-from-email"
              type="email"
              value={fromEmail}
              onChange={(e) => onChange({ fromEmail: e.target.value })}
              placeholder="newsletter@orgatick.in"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="camp-reply-to" className="text-xs">
              Reply-To (Optional)
            </Label>
            <Input
              id="camp-reply-to"
              type="email"
              value={replyTo}
              onChange={(e) => onChange({ replyTo: e.target.value })}
              placeholder="support@orgatick.in"
            />
          </div>
        </div>

        <div className="border-t border-border/40 pt-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <Label htmlFor="camp-registered-only" className="text-xs">
                Registered users only
              </Label>
              <p className="text-[11px] text-muted-foreground">Skip subscribers without an account</p>
            </div>
            <Switch
              id="camp-registered-only"
              checked={onlyRegisteredUsers}
              onCheckedChange={(checked) => onChange({ onlyRegisteredUsers: checked })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="camp-limit" className="text-xs">
              Cap Recipient Limit
            </Label>
            <Input
              id="camp-limit"
              type="number"
              min={1}
              value={limit}
              onChange={(e) => onChange({ limit: e.target.value })}
              placeholder="Send to all (no limit)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
