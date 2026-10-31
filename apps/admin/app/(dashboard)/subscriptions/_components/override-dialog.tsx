"use client";

import { useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orgatick/ui/components/dialog";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Switch } from "@orgatick/ui/components/switch";
import { adminCreateOverride } from "@/lib/subscription.api";
import { toast } from "sonner";
import { IconAdjustments } from "@tabler/icons-react";

interface OverrideDialogProps {
  features: { id: string; name: string; code: string }[];
  limits: { id: string; name: string; code: string }[];
}

export function OverrideDialog({ features, limits }: OverrideDialogProps) {
  const [open, setOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [targetType, setTargetType] = useState<"feature" | "limit">("feature");
  const [featureId, setFeatureId] = useState("");
  const [limitDefId, setLimitDefId] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [limitValue, setLimitValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(true);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId.trim() || !reason.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await adminCreateOverride(organizationId.trim(), {
        overrideTarget: targetType,
        featureId: targetType === "feature" ? featureId : undefined,
        limitDefId: targetType === "limit" ? limitDefId : undefined,
        isUnlimited: targetType === "limit" ? isUnlimited : false,
        overrideLimitValue: targetType === "limit" && !isUnlimited ? limitValue : undefined,
        overrideBooleanValue: targetType === "feature" ? booleanValue : undefined,
        reason: reason.trim(),
      });
      toast.success("Entitlement override created successfully!");
      setOpen(false);
      setOrganizationId("");
      setReason("");
      setLimitValue("");
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to create entitlement override";
      toast.error(errorMsg || "Failed to create entitlement override");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <IconAdjustments className="size-4" />
            Create Entitlement Override
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Entitlement Override</DialogTitle>
            <DialogDescription>
              Grant an organization a custom numerical limit or feature toggle overriding their base subscription plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="ovOrgId">Organization ID</Label>
              <Input
                id="ovOrgId"
                placeholder="e.g. 1"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Override Target Type</Label>
              <Select
                value={targetType}
                onValueChange={(val) => setTargetType((val as "feature" | "limit") ?? "feature")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature Flag</SelectItem>
                  <SelectItem value="limit">Numerical Limit Quota</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === "feature" ? (
              <>
                <div className="space-y-1.5">
                  <Label>Feature</Label>
                  <Select value={featureId} onValueChange={(val) => setFeatureId(val ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feature" />
                    </SelectTrigger>
                    <SelectContent>
                      {features.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} ({f.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Enable Feature</Label>
                    <p className="text-xs text-muted-foreground">Grant access to this feature</p>
                  </div>
                  <Switch checked={booleanValue} onCheckedChange={setBooleanValue} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Limit Definition</Label>
                  <Select value={limitDefId} onValueChange={(val) => setLimitDefId(val ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a limit metric" />
                    </SelectTrigger>
                    <SelectContent>
                      {limits.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name} ({l.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Unlimited Quota</Label>
                    <p className="text-xs text-muted-foreground">Remove all numerical constraints</p>
                  </div>
                  <Switch checked={isUnlimited} onCheckedChange={setIsUnlimited} />
                </div>

                {!isUnlimited && (
                  <div className="space-y-1.5">
                    <Label htmlFor="limitVal">Overridden Limit Value</Label>
                    <Input
                      id="limitVal"
                      type="number"
                      placeholder="e.g. 100"
                      value={limitValue}
                      onChange={(e) => setLimitValue(e.target.value)}
                      required={!isUnlimited}
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="ovReason">Audit Reason</Label>
              <Input
                id="ovReason"
                placeholder="Reason for this administrative exception"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Override"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
