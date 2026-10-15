"use client";

import React from "react";
import { ScrollArea } from "@orgatick/ui/components/scroll-area";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { InspectorGeometry } from "./inspector-geometry";
import { InspectorTypography } from "./inspector-typography";
import { InspectorQr } from "./inspector-qr";
import { InspectorCanvasSettings } from "./inspector-canvas-settings";
import { EditorLayersPanel } from "./editor-layers-panel";

export function EditorInspector() {
  const [activeTab, setActiveTab] = React.useState<"properties" | "layers">("properties");
  const selectedElementId = useTicketEditorStore((s) => s.selectedElementId);
  const elements = useTicketEditorStore((s) => s.elements);

  const selectedElement = React.useMemo(
    () => elements.find((el) => el.id === selectedElementId),
    [elements, selectedElementId],
  );

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full select-none">
      {/* Top Segmented Tabs: Properties vs Layers */}
      <div className="p-2.5 border-b border-border/60">
        <div className="flex rounded-lg bg-muted/50 p-1 border border-border/50">
          <button
            type="button"
            onClick={() => setActiveTab("properties")}
            className={`flex-1 py-1 px-2 rounded-md text-xs transition-all ${
              activeTab === "properties"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            Properties
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("layers")}
            className={`flex-1 py-1 px-2 rounded-md text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "layers"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <span>Layers</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
              {elements.length}
            </span>
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {activeTab === "layers" ? (
          <EditorLayersPanel />
        ) : selectedElement ? (
          <div className="space-y-4">
            <InspectorGeometry element={selectedElement} />
            {selectedElement.type === "text" && <InspectorTypography element={selectedElement} />}
            {selectedElement.type === "qr" && <InspectorQr element={selectedElement} />}
          </div>
        ) : (
          <InspectorCanvasSettings />
        )}
      </ScrollArea>
    </aside>
  );
}
