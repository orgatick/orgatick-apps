"use client";

import React from "react";
import Link from "next/link";
import { IconEye, IconPalette, IconPlus, IconQrcode, IconTicket } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Badge } from "@orgatick/ui/components/badge";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { EditorPreviewModal } from "@/components/ticket-editor/editor-preview-modal";

const SAMPLE_TEMPLATES = [
  {
    id: "tpl_summit_vip",
    name: "VIP Summit Event Pass",
    description: "High-contrast dark badge designed for all-access summits, conferences, and hackathons.",
    dimensions: "1200 × 600",
    status: "draft" as const,
    updatedAt: "Just now",
    isDefault: true,
  },
  {
    id: "tpl_badge_portrait",
    name: "Vertical Lanyard Badge",
    description: "Portrait format suited for laminated lanyards and multi-day convention entry.",
    dimensions: "600 × 900",
    status: "published" as const,
    updatedAt: "2 days ago",
    isDefault: false,
  },
  {
    id: "tpl_wristband_slip",
    name: "Minimal Wristband Slip",
    description: "Compact aspect ratio for fast thermal printing and wristband gate verification.",
    dimensions: "1200 × 320",
    status: "draft" as const,
    updatedAt: "5 days ago",
    isDefault: false,
  },
];

export default function TicketTemplatesPage() {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const resetToDefault = useTicketEditorStore((s) => s.resetToDefault);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <IconTicket className="size-6 text-primary" />
            <span>Ticket Templates</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design, brand, and publish personalized event tickets with dynamic attendee data and verification QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="gap-1.5">
            <IconEye className="size-4" />
            <span>Sample Preview</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={resetToDefault}
            render={<Link href="/ticket-templates/editor" />}
            className="gap-1.5"
          >
            <IconPlus className="size-4" />
            <span>New Template</span>
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SAMPLE_TEMPLATES.map((tpl) => (
          <Card
            key={tpl.id}
            className="border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant={tpl.status === "published" ? "default" : "secondary"}>{tpl.status}</Badge>
                {tpl.isDefault && (
                  <span className="font-mono text-[10px] text-primary font-semibold uppercase tracking-wider">
                    Default Pass
                  </span>
                )}
              </div>
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                {tpl.name}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2 mt-1">{tpl.description}</CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              {/* Mini Preview Mockup */}
              <div className="aspect-[2/1] rounded-lg bg-slate-900 border border-slate-800 p-3 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-sky-400">ORGATICK PASS</span>
                  <span className="text-[9px] font-mono text-slate-400">{tpl.dimensions}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white truncate max-w-[120px]">Alex Chen</div>
                    <div className="text-[9px] text-amber-400 font-mono">VIP ALL-ACCESS</div>
                  </div>
                  <div className="size-8 bg-white rounded p-0.5 grid place-items-center">
                    <IconQrcode className="size-6 text-black" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  render={<Link href="/ticket-templates/editor" />}
                >
                  <IconPalette className="size-3.5" />
                  <span>Open Editor</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => setPreviewOpen(true)}
                  title="Quick Preview"
                >
                  <IconEye className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      <EditorPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}
