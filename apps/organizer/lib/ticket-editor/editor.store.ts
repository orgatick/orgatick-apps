import { create } from "zustand";
import type { TicketBackground, TicketCanvasConfig, TicketElement } from "./editor-types";
import { DEFAULT_TEMPLATE_CANVAS, DEFAULT_TEMPLATE_ELEMENTS } from "./default-template";
import { type HistorySnapshot, createSnapshot } from "./history-helpers";
import { duplicateElementHelper, moveElementLayerHelper, reorderElementHelper } from "./store-helpers";
import { calculateFitZoom, scaleElementsToCanvas } from "./canvas-resize-helpers";

interface TicketEditorStore {
  templateId: string;
  templateName: string;
  status: "draft" | "published" | "archived";
  canvas: TicketCanvasConfig;
  background: TicketBackground | null;
  elements: TicketElement[];
  selectedElementId: string | null;
  zoom: number;
  gridSnap: boolean;
  gridSize: number;
  showGrid: boolean;
  previewMode: boolean;
  selectedAttendeeProfileId: string;
  isDirty: boolean;
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions
  setTemplateName: (name: string) => void;
  setCanvas: (config: Partial<TicketCanvasConfig>) => void;
  setBackground: (bg: TicketBackground | null) => void;
  applyBaseImage: (url: string, naturalWidth: number, naturalHeight: number, scale?: boolean) => void;
  setSelectedElementId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setGridSnap: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  setSelectedAttendeeProfileId: (id: string) => void;
  addElement: (el: Omit<TicketElement, "id" | "zIndex">) => void;
  updateElement: (id: string, updates: Partial<TicketElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  reorderElement: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
  moveElementLayer: (sourceId: string, targetId: string, position: "above" | "below") => void;
  toggleElementLock: (id: string) => void;
  toggleElementHidden: (id: string) => void;
  undo: () => void;
  redo: () => void;
  resetToDefault: () => void;
}

export const useTicketEditorStore = create<TicketEditorStore>((set, get) => ({
  templateId: "tpl_draft_01",
  templateName: "VIP Summit Event Pass",
  status: "draft",
  canvas: DEFAULT_TEMPLATE_CANVAS,
  background: null,
  elements: DEFAULT_TEMPLATE_ELEMENTS,
  selectedElementId: null,
  zoom: 0.85,
  gridSnap: true,
  gridSize: 16,
  showGrid: false,
  previewMode: false,
  selectedAttendeeProfileId: "attendee_vip",
  isDirty: false,
  past: [],
  future: [],

  setTemplateName: (name) => set({ templateName: name, isDirty: true }),
  setCanvas: (cfg) => set((s) => ({ canvas: { ...s.canvas, ...cfg }, isDirty: true })),
  setBackground: (bg) => set({ background: bg, isDirty: true }),

  applyBaseImage: (url, naturalWidth, naturalHeight, scale = true) => {
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    const oldCanvas = get().canvas;
    const newCanvas: TicketCanvasConfig = {
      ...oldCanvas,
      width: naturalWidth,
      height: naturalHeight,
      presetName: `Base Image (${naturalWidth} × ${naturalHeight})`,
    };
    const newElements = scale ? scaleElementsToCanvas(get().elements, oldCanvas, newCanvas) : get().elements;
    const newZoom = calculateFitZoom(naturalWidth, naturalHeight);

    set((s) => ({
      past: [...s.past.slice(-30), snap],
      future: [],
      canvas: newCanvas,
      background: { url, fit: "cover", opacity: 1, naturalWidth, naturalHeight },
      elements: newElements,
      zoom: newZoom,
      isDirty: true,
    }));
  },

  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setZoom: (zoom) => set({ zoom: Math.min(2.0, Math.max(0.3, Number(zoom.toFixed(2)))) }),
  setGridSnap: (snap) => set({ gridSnap: snap }),
  setGridSize: (size) => set({ gridSize: size }),
  setShowGrid: (show) => set({ showGrid: show }),
  setPreviewMode: (preview) => set({ previewMode: preview }),
  setSelectedAttendeeProfileId: (id) => set({ selectedAttendeeProfileId: id }),

  addElement: (el) => {
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    const newId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const maxZ = get().elements.reduce((max, item) => Math.max(max, item.zIndex), 0);
    const newEl: TicketElement = { ...el, id: newId, zIndex: maxZ + 1 };
    set((s) => ({
      past: [...s.past.slice(-30), snap],
      future: [],
      elements: [...s.elements, newEl],
      selectedElementId: newId,
      isDirty: true,
    }));
  },

  updateElement: (id, updates) => {
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      isDirty: true,
    }));
  },

  removeElement: (id) => {
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    set((s) => ({
      past: [...s.past.slice(-30), snap],
      future: [],
      elements: s.elements.filter((el) => el.id !== id),
      selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
      isDirty: true,
    }));
  },

  duplicateElement: (id) => {
    const target = get().elements.find((el) => el.id === id);
    if (!target) return;
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    const clone = duplicateElementHelper(target, get().elements, get().canvas);
    set((s) => ({
      past: [...s.past.slice(-30), snap],
      future: [],
      elements: [...s.elements, clone],
      selectedElementId: clone.id,
      isDirty: true,
    }));
  },

  reorderElement: (id, direction) => {
    const sorted = reorderElementHelper(id, direction, get().elements);
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    set((s) => ({
      past: [...s.past.slice(-30), snap],
      future: [],
      elements: sorted,
      isDirty: true,
    }));
  },

  moveElementLayer: (sourceId, targetId, position) => {
    const sorted = moveElementLayerHelper(sourceId, targetId, position, get().elements);
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    set((s) => ({
      past: [...s.past.slice(-30), snap],
      future: [],
      elements: sorted,
      isDirty: true,
    }));
  },

  toggleElementLock: (id) => {
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el)),
      isDirty: true,
    }));
  },

  toggleElementHidden: (id) => {
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, hidden: !el.hidden } : el)),
      isDirty: true,
    }));
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    set({
      past: past.slice(0, past.length - 1),
      future: [snap, ...future.slice(0, 30)],
      elements: prev.elements,
      canvas: prev.canvas,
      background: prev.background,
      isDirty: true,
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    const snap = createSnapshot(get().elements, get().canvas, get().background);
    set({
      past: [...past.slice(-30), snap],
      future: future.slice(1),
      elements: next.elements,
      canvas: next.canvas,
      background: next.background,
      isDirty: true,
    });
  },

  resetToDefault: () => {
    set({
      elements: DEFAULT_TEMPLATE_ELEMENTS,
      canvas: DEFAULT_TEMPLATE_CANVAS,
      background: null,
      selectedElementId: null,
      isDirty: false,
    });
  },
}));
