"use client";

import { useEffect, useState } from "react";
import { IconExternalLink, IconFile } from "@tabler/icons-react";
import type { OrgDocumentRef } from "@/lib/types";
import { fetchOrganizationDocumentUrl, type OrganizationDocumentUrl } from "@/lib/org-admin.api";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp"];

function getExtension(url: string): string {
  try {
    return (new URL(url).pathname.split(".").pop() ?? "").toLowerCase();
  } catch {
    return url.split(".").pop()?.toLowerCase() ?? "";
  }
}

function isImage(url: string): boolean {
  return IMAGE_EXTENSIONS.includes(getExtension(url));
}

function useSignedDocumentUrl(organizationId: string, document: OrgDocumentRef) {
  const [result, setResult] = useState<OrganizationDocumentUrl | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setFailed(false);
    fetchOrganizationDocumentUrl(organizationId, String(document.id))
      .then((url) => {
        if (!cancelled) setResult(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId, document.id]);

  return { result, failed };
}

export function DocumentPreview({ organizationId, document }: { organizationId: string; document: OrgDocumentRef }) {
  const [open, setOpen] = useState(false);
  const { result, failed } = useSignedDocumentUrl(organizationId, document);
  const image = isImage(document.fileUrl);

  if (failed) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
        Could not load the file. Check the backend storage environment.
      </p>
    );
  }

  if (!image) {
    return (
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <IconFile className="size-4" />
          Preview not available for this file type — open it in a new tab instead.
        </span>
        {result?.fileUrl && (
          <a
            href={result.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            View / Download <IconExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {result ? "Preview · click to expand" : "Loading preview…"}
        </p>
        {result?.fileUrl && (
          <a
            href={result.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Open <IconExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      {result?.fileUrl && (
        <button type="button" onClick={() => setOpen((value) => !value)} className="mt-2 block w-full text-left">
          {/* biome-ignore lint/performance/noImgElement: dynamic user-uploaded asset */}
          <img
            src={result.fileUrl}
            alt="Document preview"
            className={`w-full rounded-md border object-contain ${open ? "max-h-[480px]" : "max-h-56"}`}
          />
        </button>
      )}
      {!result && <div className="mt-2 h-24 animate-pulse rounded-md bg-muted" />}
    </div>
  );
}
