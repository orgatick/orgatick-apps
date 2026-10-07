"use client";

import { useState } from "react";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Textarea } from "@orgatick/ui/components/textarea";
import type { AdminOrganization, OrgDocumentRef, OrgDocumentStatus } from "@/lib/types";
import { approveDocument, rejectDocument, requestDocumentReplacement, verifyDocument } from "@/lib/org-admin.api";
import { dangerButton, successButton, useOrgAction } from "../../_components/use-org-action";
import { DocumentPreview } from "./document-preview";

function getDocumentStatusVariant(status: OrgDocumentStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "approved" || status === "verified") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

export function DocumentCard({
  organization,
  document,
}: {
  organization: AdminOrganization;
  document: OrgDocumentRef;
}) {
  const { pending, run } = useOrgAction({ successMessage: "Document updated" });
  const [note, setNote] = useState("");
  const id = String(organization.id);
  const documentId = String(document.id);
  const fileName = document.fileUrl.split("/").pop() ?? document.fileUrl;

  return (
    <div className="space-y-3 rounded-xl border border-border/60 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold capitalize text-foreground">
              {document.type.replace(/_/g, " ").toLowerCase()}
            </p>
            <Badge variant={getDocumentStatusVariant(document.status)}>{document.status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            Uploaded by {document.uploader?.name ?? "unknown"} ·{" "}
            {new Date(document.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {document.status === "rejected" || document.status === "replacement_requested" ? (
        <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Admin note: {document.reviewNote ?? "—"}
          {document.reviewer?.name ? ` · reviewed by ${document.reviewer.name}` : ""}
        </p>
      ) : document.reviewNote ? (
        <p className="text-xs text-muted-foreground">
          Admin note: {document.reviewNote}
          {document.reviewer?.name ? ` · reviewed by ${document.reviewer.name}` : ""}
        </p>
      ) : null}

      <DocumentPreview organizationId={id} document={document} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={successButton}
          disabled={pending}
          onClick={() => run(() => approveDocument(id, documentId))}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={successButton}
          disabled={pending}
          onClick={() => run(() => verifyDocument(id, documentId))}
        >
          Verify
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => requestDocumentReplacement(id, documentId, note.trim()))}
        >
          Request replacement
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={dangerButton}
          disabled={pending}
          onClick={() => run(() => rejectDocument(id, documentId, note.trim()))}
        >
          Reject
        </Button>
      </div>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Note for reject / replacement request"
        rows={1}
      />
    </div>
  );
}
