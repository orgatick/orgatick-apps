"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import type { AdminOrganization } from "@/lib/types";
import { DocumentCard } from "./document-card";

interface DocumentsPanelProps {
  organization: AdminOrganization;
}

export function DocumentsPanel({ organization }: DocumentsPanelProps) {
  const documents = organization.documents ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Documents <span className="text-xs font-normal text-muted-foreground">({documents.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No documents uploaded yet. Request documents from the Verification page.
          </p>
        )}
        {documents.map((document) => (
          <DocumentCard key={document.id} organization={organization} document={document} />
        ))}
      </CardContent>
    </Card>
  );
}
