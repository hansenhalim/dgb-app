import { Platform } from "react-native";

export const colors = {
  bg: "#fafaf7",
  surface: "#ffffff",
  rule: "#e2e2db",
  ruleStrong: "#c9c9c0",
  ink: "#0b0b0c",
  ink2: "#2a2a2d",
  inkMuted: "#6a6a66",
  inkDim: "#9a9a94",
  accent: "#22c55e",
  accentInk: "#ffffff",
  red: "#b91c1c",
  green: "#15803d",
};

export const radius = {
  base: 6,
  sm: 4,
};

export const fonts = {
  sans: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }) as string,
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }) as string,
};
