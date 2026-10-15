export interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Element" | "History" | "Canvas" | "View";
}

export const EDITOR_SHORTCUTS: ShortcutItem[] = [
  // History
  { keys: ["Ctrl", "Z"], description: "Undo last change", category: "History" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo change (or Ctrl+Y)", category: "History" },

  // Element
  { keys: ["Ctrl", "D"], description: "Duplicate selected element", category: "Element" },
  { keys: ["Delete"], description: "Delete selected element (or Backspace)", category: "Element" },
  { keys: ["↑", "↓", "←", "→"], description: "Nudge element by 1px", category: "Element" },
  { keys: ["Shift", "Arrows"], description: "Fast nudge element by 10px", category: "Element" },
  { keys: ["Esc"], description: "Deselect current element", category: "Element" },

  // Canvas
  { keys: ["Ctrl", "+"], description: "Zoom in", category: "Canvas" },
  { keys: ["Ctrl", "-"], description: "Zoom out", category: "Canvas" },
  { keys: ["Ctrl", "0"], description: "Reset zoom to fit", category: "Canvas" },
  { keys: ["G"], description: "Toggle grid snapping (or Ctrl+G)", category: "Canvas" },

  // View
  { keys: ["P"], description: "Toggle preview mode", category: "View" },
  { keys: ["?"], description: "Show keyboard shortcuts cheat sheet", category: "View" },
];
