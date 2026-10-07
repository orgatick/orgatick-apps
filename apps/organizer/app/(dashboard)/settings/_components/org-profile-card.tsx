"use client";

import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { Textarea } from "@orgatick/ui/components/textarea";
import { toast } from "sonner";
import { updateCurrentOrganization } from "@/lib/apis/organization.api";
import { IconBuilding, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrgProfileCardProps {
  organizationId: string;
  initialName: string;
  initialDescription?: string | null;
}

export function OrgProfileCard({ organizationId, initialName, initialDescription }: OrgProfileCardProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Organization name cannot be empty");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await updateCurrentOrganization(organizationId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Organization profile updated");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border border-border/60 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBuilding className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">General Profile</CardTitle>
        </div>
        <CardDescription>
          Your organization&apos;s public name and overview displayed to attendees and partners.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="org-name">Organization Name</FieldLabel>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Events Co."
                required
                disabled={isSubmitting}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="org-desc">About & Description</FieldLabel>
              <Textarea
                id="org-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your organization does..."
                disabled={isSubmitting}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/40 pt-4">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconCheck className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
