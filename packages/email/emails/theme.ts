import { pixelBasedPreset } from "react-email";

/** ORGATICK Official Theme Design Tokens */
export const themeColors = {
  // Light Theme (Default for Emails)
  background: "#f4f7fc",
  foreground: "#1a2b4c",
  card: "#ffffff",
  cardForeground: "#1a2b4c",
  popover: "#ffffff",
  popoverForeground: "#1a2b4c",

  primary: "#204b90",
  primaryForeground: "#ffffff",
  primaryDark: "#1c458f",
  primaryLight: "#2a56a5",

  secondary: "#6355a4",
  secondaryForeground: "#ffffff",

  accent: "#5d82d9",
  accentForeground: "#ffffff",
  accentLight: "#e9eef8",

  success: "#2ecc71",
  warning: "#f1c40f",
  info: "#3498db",

  destructive: "#d9534f",
  destructiveForeground: "#ffffff",

  muted: "#e7ecf3",
  mutedForeground: "#6c7480",

  border: "#c6ccd5",
  borderLight: "#e7ecf3",
  input: "#d8dde6",
  ring: "#2a56a5",

  // Charts
  chart1: "#1c458f",
  chart2: "#5f82d9",
  chart3: "#819ed0",
  chart4: "#476fb4",
  chart5: "#0f3475",

  // Sidebar
  sidebar: "#f4f7fc",
  sidebarForeground: "#1a2b4c",
  sidebarPrimary: "#204b90",
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: "#e9eef8",
  sidebarAccentForeground: "#1a2b4c",
  sidebarBorder: "#c6ccd5",
  sidebarRing: "#2a56a5",
} as const;

/**
 * Standard Tailwind Configuration for React Email templates in ORGATICK
 */
export const orgatickTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        background: themeColors.background,
        foreground: themeColors.foreground,
        card: themeColors.card,
        "card-foreground": themeColors.cardForeground,
        popover: themeColors.popover,
        "popover-foreground": themeColors.popoverForeground,
        primary: {
          DEFAULT: themeColors.primary,
          foreground: themeColors.primaryForeground,
          dark: themeColors.primaryDark,
          light: themeColors.primaryLight,
        },
        secondary: {
          DEFAULT: themeColors.secondary,
          foreground: themeColors.secondaryForeground,
        },
        accent: {
          DEFAULT: themeColors.accent,
          foreground: themeColors.accentForeground,
          light: themeColors.accentLight,
        },
        success: themeColors.success,
        warning: themeColors.warning,
        info: themeColors.info,
        destructive: {
          DEFAULT: themeColors.destructive,
          foreground: themeColors.destructiveForeground,
        },
        muted: {
          DEFAULT: themeColors.muted,
          foreground: themeColors.mutedForeground,
        },
        border: {
          DEFAULT: themeColors.border,
          light: themeColors.borderLight,
        },
        input: themeColors.input,
        ring: themeColors.ring,
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "10px",
      },
    },
  },
};
