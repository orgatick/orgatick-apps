"use client";

import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { toast } from "sonner";
import { updateCurrentOrganization } from "@/lib/apis/organization.api";
import { IconCheck, IconLoader2, IconMail } from "@tabler/icons-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrgContactCardProps {
  organizationId: string;
  initialEmail?: string | null;
  initialPhone?: string | null;
}

export function OrgContactCard({ organizationId, initialEmail, initialPhone }: OrgContactCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateCurrentOrganization(organizationId, {
        email: email.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
      });
      toast.success("Contact information updated");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update contact";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border border-border/60 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconMail className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Contact & Communications</CardTitle>
        </div>
        <CardDescription>
          Primary communications channel for official receipts, inquiries, and notifications.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="org-email">Official Email</FieldLabel>
              <Input
                id="org-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@org.com"
                disabled={isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="org-phone">Phone Number</FieldLabel>
              <Input
                id="org-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
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
