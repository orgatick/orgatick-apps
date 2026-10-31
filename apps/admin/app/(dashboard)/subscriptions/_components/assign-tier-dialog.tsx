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
import { adminAssignPlan } from "@/lib/subscription.api";
import { toast } from "sonner";
import { IconShieldCheck } from "@tabler/icons-react";

interface AssignTierDialogProps {
  plans: { id: string; name: string; code: string }[];
}

export function AssignTierDialog({ plans }: AssignTierDialogProps) {
  const [open, setOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [planId, setPlanId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId.trim() || !planId) {
      toast.error("Please enter Organization ID and select a Plan");
      return;
    }

    try {
      setLoading(true);
      await adminAssignPlan(organizationId.trim(), planId, reason.trim() || undefined);
      toast.success("Subscription plan assigned successfully!");
      setOpen(false);
      setOrganizationId("");
      setPlanId("");
      setReason("");
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to assign subscription plan";
      toast.error(errorMsg || "Failed to assign subscription plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" className="gap-2">
            <IconShieldCheck className="size-4" />
            Assign Tier to Organization
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Direct Subscription Assignment</DialogTitle>
            <DialogDescription>
              Assign a subscription plan directly to an organization tenant. This bypasses checkout and takes effect
              immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgId">Organization ID</Label>
              <Input
                id="orgId"
                placeholder="e.g. 1"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="planSelect">Target Plan</Label>
              <Select value={planId} onValueChange={(val) => setPlanId(val ?? "")}>
                <SelectTrigger id="planSelect">
                  <SelectValue placeholder="Select a plan tier" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Administrative Reason</Label>
              <Input
                id="reason"
                placeholder="e.g. Enterprise pilot agreement"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
