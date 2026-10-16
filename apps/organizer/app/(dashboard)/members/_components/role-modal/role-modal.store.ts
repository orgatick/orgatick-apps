import { create } from "zustand";
import type { OrganizationPermissionOptionResponse, OrganizationRoleOptionResponse } from "@orgatick/contracts";

interface RoleModalErrors {
  name?: string;
  permissions?: string;
}

interface RoleModalState {
  name: string;
  description: string;
  selectedPermissions: Set<string>;
  activeCategory: string;
  searchFilter: string;
  availablePermissions: OrganizationPermissionOptionResponse[];
  loadingPermissions: boolean;
  submitting: boolean;
  errors: RoleModalErrors;

  initialize: (roleToEdit?: OrganizationRoleOptionResponse | null) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setActiveCategory: (category: string) => void;
  setSearchFilter: (filter: string) => void;
  togglePermission: (key: string, nextChecked?: boolean) => void;
  toggleCurrentCategory: (targetPerms: OrganizationPermissionOptionResponse[]) => void;
  selectAll: () => void;
  clearAll: () => void;
  setErrors: (errors: RoleModalErrors) => void;
  clearError: (field: keyof RoleModalErrors) => void;
  setSubmitting: (submitting: boolean) => void;
  setAvailablePermissions: (perms: OrganizationPermissionOptionResponse[]) => void;
  setLoadingPermissions: (loading: boolean) => void;
  reset: () => void;
}

export const useRoleModalStore = create<RoleModalState>((set) => ({
  name: "",
  description: "",
  selectedPermissions: new Set(),
  activeCategory: "all",
  searchFilter: "",
  availablePermissions: [],
  loadingPermissions: false,
  submitting: false,
  errors: {},

  initialize: (roleToEdit) => {
    if (roleToEdit) {
      set({
        name: roleToEdit.name || "",
        description: roleToEdit.description || "",
        selectedPermissions: new Set(roleToEdit.permissions || []),
        activeCategory: "all",
        searchFilter: "",
        errors: {},
      });
    } else {
      set({
        name: "",
        description: "",
        selectedPermissions: new Set(),
        activeCategory: "all",
        searchFilter: "",
        errors: {},
      });
    }
  },

  setName: (name) => {
    set((state) => ({
      name,
      errors: state.errors.name ? { ...state.errors, name: undefined } : state.errors,
    }));
  },

  setDescription: (description) => set({ description }),

  setActiveCategory: (activeCategory) => set({ activeCategory }),

  setSearchFilter: (searchFilter) => set({ searchFilter }),

  togglePermission: (key, nextChecked) => {
    set((state) => {
      const next = new Set(state.selectedPermissions);
      const shouldAdd = typeof nextChecked === "boolean" ? nextChecked : !next.has(key);
      if (shouldAdd) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return {
        selectedPermissions: next,
        errors: state.errors.permissions ? { ...state.errors, permissions: undefined } : state.errors,
      };
    });
  },

  toggleCurrentCategory: (targetPerms) => {
    if (targetPerms.length === 0) return;
    set((state) => {
      const allChecked = targetPerms.every((p) => state.selectedPermissions.has(p.key));
      const next = new Set(state.selectedPermissions);
      for (const p of targetPerms) {
        if (allChecked) {
          next.delete(p.key);
        } else {
          next.add(p.key);
        }
      }
      return {
        selectedPermissions: next,
        errors: state.errors.permissions ? { ...state.errors, permissions: undefined } : state.errors,
      };
    });
  },

  selectAll: () => {
    set((state) => ({
      selectedPermissions: new Set(state.availablePermissions.map((p) => p.key)),
      errors: state.errors.permissions ? { ...state.errors, permissions: undefined } : state.errors,
    }));
  },

  clearAll: () => set({ selectedPermissions: new Set() }),

  setErrors: (errors) => set({ errors }),

  clearError: (field) => {
    set((state) => ({
      errors: { ...state.errors, [field]: undefined },
    }));
  },

  setSubmitting: (submitting) => set({ submitting }),

  setAvailablePermissions: (availablePermissions) => set({ availablePermissions }),

  setLoadingPermissions: (loadingPermissions) => set({ loadingPermissions }),

  reset: () => {
    set({
      name: "",
      description: "",
      selectedPermissions: new Set(),
      activeCategory: "all",
      searchFilter: "",
      errors: {},
      submitting: false,
    });
  },
}));
