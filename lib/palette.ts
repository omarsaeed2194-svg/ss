export const LIGHT = {
  surface: "#fcfcfb",
  textPrimary: "#0b0b0b",
  textSecondary: "#52514e",
  textMuted: "#898781",
  grid: "#e1e0d9",
  baseline: "#c3c2b7",
  series1: "#2a78d6",
  series2: "#eb6834",
  series3: "#1baf7a",
  series4: "#eda100",
};

export const DARK = {
  surface: "#1a1a19",
  textPrimary: "#ffffff",
  textSecondary: "#c3c2b7",
  textMuted: "#898781",
  grid: "#2c2c2a",
  baseline: "#383835",
  series1: "#3987e5",
  series2: "#d95926",
  series3: "#199e70",
  series4: "#c98500",
};

export function getPalette(isDark: boolean) {
  return isDark ? DARK : LIGHT;
}
