import type { PermissionDefinition } from "../types/permission.types";

export const TICKET_PERMISSIONS = {
  CREATE: "event:ticket:create",
  VIEW: "event:ticket:view",
  UPDATE: "event:ticket:update",
  DELETE: "event:ticket:delete",
  PAUSE: "event:ticket:pause",
  MANAGE_INVENTORY: "event:ticket:manage_inventory",
} as const;

export type TicketPermission = (typeof TICKET_PERMISSIONS)[keyof typeof TICKET_PERMISSIONS];

export const TICKET_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: TICKET_PERMISSIONS.CREATE,
    name: "Create Ticket",
    description: "Allows creating new ticket tiers, pricing, and ticket types",
    resource: "ticket",
    action: "create",
    scope: "event",
    category: "ticket",
  },
  {
    key: TICKET_PERMISSIONS.VIEW,
    name: "View Ticket",
    description: "Allows viewing ticket tiers, pricing rules, capacity, and sales metrics",
    resource: "ticket",
    action: "view",
    scope: "event",
    category: "ticket",
  },
  {
    key: TICKET_PERMISSIONS.UPDATE,
    name: "Update Ticket",
    description: "Allows editing ticket pricing, sales windows, quantities, and descriptions",
    resource: "ticket",
    action: "update",
    scope: "event",
    category: "ticket",
  },
  {
    key: TICKET_PERMISSIONS.DELETE,
    name: "Delete Ticket",
    description: "Allows deleting unused ticket types and tiers",
    resource: "ticket",
    action: "delete",
    scope: "event",
    category: "ticket",
  },
  {
    key: TICKET_PERMISSIONS.PAUSE,
    name: "Pause Ticket Sales",
    description: "Allows temporarily pausing or resuming sales for specific ticket tiers",
    resource: "ticket",
    action: "pause",
    scope: "event",
    category: "ticket",
  },
  {
    key: TICKET_PERMISSIONS.MANAGE_INVENTORY,
    name: "Manage Ticket Inventory",
    description: "Allows managing capacity limits, reserved ticket allocations, and inventory holds",
    resource: "ticket",
    action: "manage_inventory",
    scope: "event",
    category: "ticket",
  },
] as const;
