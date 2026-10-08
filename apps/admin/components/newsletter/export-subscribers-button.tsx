"use client";

import { Button } from "@orgatick/ui/components/button";
import { IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

export function ExportSubscribersButton({ listId }: { listId?: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/admin/newsletter/subscribers/export${
        listId ? `?listId=${listId}` : ""
      }`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to export subscribers");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Subscribers CSV downloaded");
    } catch {
      toast.error("Could not export subscribers CSV");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" disabled={downloading} onClick={handleExport}>
      <IconDownload className="size-4" />
      {downloading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
