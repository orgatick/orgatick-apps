"use client";

import React from "react";
import { IconCheck, IconEye, IconX } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { Badge } from "@orgatick/ui/components/badge";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { SAMPLE_ATTENDEE_PROFILES } from "@/lib/ticket-editor/sample-attendees";
import QRCode from "react-qr-code";

interface EditorPreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditorPreviewModal({ open, onClose }: EditorPreviewModalProps) {
  const canvas = useTicketEditorStore((s) => s.canvas);
  const background = useTicketEditorStore((s) => s.background);
  const elements = useTicketEditorStore((s) => s.elements);
  const selectedAttendeeProfileId = useTicketEditorStore((s) => s.selectedAttendeeProfileId);
  const setSelectedAttendeeProfileId = useTicketEditorStore((s) => s.setSelectedAttendeeProfileId);

  const currentProfile =
    SAMPLE_ATTENDEE_PROFILES.find((p) => p.id === selectedAttendeeProfileId) ?? SAMPLE_ATTENDEE_PROFILES[0];

  const scale = React.useMemo(() => {
    const maxW = 860;
    const maxH = 440;
    const fitW = maxW / (canvas.width || 1200);
    const fitH = maxH / (canvas.height || 600);
    return Math.min(fitW, fitH, 0.85);
  }, [canvas.width, canvas.height]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconEye className="size-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Live Ticket Preview</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Persona Switcher Bar */}
        <div className="px-4 py-2.5 bg-muted/30 border-b border-border/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mr-1">
            Attendee Persona:
          </span>
          {SAMPLE_ATTENDEE_PROFILES.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => setSelectedAttendeeProfileId(profile.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                selectedAttendeeProfileId === profile.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <span>{profile.name}</span>
              <Badge variant="outline" className="text-[10px] py-0 px-1">
                {profile.badge}
              </Badge>
            </button>
          ))}
        </div>

        {/* Scaled Preview Stage */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-muted/10">
          <div
            style={{
              width: Math.round(canvas.width * scale),
              height: Math.round(canvas.height * scale),
            }}
            className="relative shrink-0 flex-none"
          >
            <div
              style={{
                width: `${canvas.width}px`,
                height: `${canvas.height}px`,
                minWidth: `${canvas.width}px`,
                maxWidth: `${canvas.width}px`,
                minHeight: `${canvas.height}px`,
                maxHeight: `${canvas.height}px`,
                backgroundColor: canvas.backgroundColor,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="absolute top-0 left-0 shadow-2xl rounded-xl overflow-hidden border border-border flex-none"
            >
              {background?.url && (
                <img
                  src={background.url}
                  alt="Background"
                  className="absolute inset-0 size-full object-cover pointer-events-none"
                />
              )}

              {elements.map((el) => {
                const val = el.staticContent || (el.field ? (currentProfile.data[el.field] ?? el.label) : el.label);
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      zIndex: el.zIndex,
                    }}
                    className="flex items-center overflow-hidden"
                  >
                    {el.type === "qr" ? (
                      <div className="size-full flex items-center justify-center p-1 bg-white rounded">
                        <QRCode
                          value={val}
                          size={Math.min(el.width, el.height) - 8}
                          fgColor={el.qrConfig?.colorDark ?? "#000000"}
                          bgColor={el.qrConfig?.colorLight ?? "#ffffff"}
                          className="size-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: el.style.fontFamily,
                          fontSize: `${el.style.fontSize}px`,
                          fontWeight: el.style.fontWeight,
                          color: el.style.color,
                          textAlign: el.style.textAlign,
                          backgroundColor: el.style.backgroundColor,
                          borderRadius: el.style.borderRadius ? `${el.style.borderRadius}px` : undefined,
                          padding: el.style.padding ? `${el.style.padding}px` : undefined,
                        }}
                        className="truncate w-full leading-tight"
                      >
                        {val}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: Scan Simulation Banner */}
        <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <IconCheck className="size-4" />
            <span>Simulated Gate Scan: Valid Verified Ticket</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
