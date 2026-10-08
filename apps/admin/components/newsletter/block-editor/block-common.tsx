import { Label } from "@orgatick/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import type { Align } from "./block-editor-types";

export function AlignPicker({ value, onChange }: { value: Align; onChange: (align: Align) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Alignment</Label>
      <Select value={value} onValueChange={(next) => onChange(next as Align)}>
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
