export interface DualTonePalette {
  name?: string;
  bg: string;     // HEX code for background (Base)
  accent: string; // HEX code for accent (Primary/Foreground)
}

export const DUAL_TONE_PRESETS: DualTonePalette[] = [
  { name: "Oceano Profundo", bg: "#0f172a", accent: "#6366f1" },
  { name: "Cyber Ciano", bg: "#090d16", accent: "#06b6d4" },
  { name: "Esmeralda Mint", bg: "#0d1a15", accent: "#10b981" },
  { name: "Âmbar Dourado", bg: "#17120a", accent: "#f59e0b" },
  { name: "Rosa Velvet", bg: "#181016", accent: "#f43f5e" },
  { name: "Violeta Noturno", bg: "#130f26", accent: "#8b5cf6" },
  { name: "Grafite Minimal", bg: "#18181b", accent: "#38bdf8" },
  { name: "Claro Neve & Índigo", bg: "#f8fafc", accent: "#4f46e5" },
  { name: "Claro Creme & Violeta", bg: "#faf8f5", accent: "#7c3aed" },
  { name: "Claro Menta", bg: "#f0fdf4", accent: "#059669" },
];

export const DEFAULT_PALETTE: DualTonePalette = {
  name: "Oceano Profundo",
  bg: "#0f172a",
  accent: "#6366f1",
};

// Helper: Parse Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length !== 6) {
    return { r: 15, g: 23, b: 42 }; // Fallback
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper: Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b))
    .toString(16)
    .slice(1);
  return `#${hex}`;
}

// Helper: Calculate Luminance
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Helper: Blend two hex colors
function blendHex(hex1: string, hex2: string, weight: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = c1.r * (1 - weight) + c2.r * weight;
  const g = c1.g * (1 - weight) + c2.g * weight;
  const b = c1.b * (1 - weight) + c2.b * weight;
  return rgbToHex(r, g, b);
}

// Helper: Validate Hex String
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

// Apply palette variables to DOM
export function applyDualTonePalette(palette: DualTonePalette): void {
  const bgHex = isValidHex(palette.bg) ? palette.bg : DEFAULT_PALETTE.bg;
  const accentHex = isValidHex(palette.accent) ? palette.accent : DEFAULT_PALETTE.accent;

  const bgRgb = hexToRgb(bgHex);
  const accentRgb = hexToRgb(accentHex);
  const bgLuminance = getLuminance(bgHex);
  const isDark = bgLuminance <= 0.5;

  // Compute Surface, Surface Hover, Border, Text colors
  let surfaceHex: string;
  let surfaceHoverHex: string;
  let borderHex: string;
  let textHex: string;
  let textMutedHex: string;

  if (isDark) {
    // Dark mode computations
    surfaceHex = blendHex(bgHex, "#ffffff", 0.08);
    surfaceHoverHex = blendHex(bgHex, "#ffffff", 0.14);
    borderHex = blendHex(bgHex, "#ffffff", 0.16);
    textHex = "#f8fafc";
    textMutedHex = "#94a3b8";
  } else {
    // Light mode computations
    surfaceHex = blendHex(bgHex, "#ffffff", 0.6);
    if (bgHex.toLowerCase() === "#ffffff" || bgHex.toLowerCase() === "#f8fafc") {
      surfaceHex = "#ffffff";
    }
    surfaceHoverHex = blendHex(bgHex, "#000000", 0.05);
    borderHex = blendHex(bgHex, "#000000", 0.12);
    textHex = "#0f172a";
    textMutedHex = "#64748b";
  }

  // Accent variations
  const accentHoverHex = isDark
    ? blendHex(accentHex, "#ffffff", 0.15)
    : blendHex(accentHex, "#000000", 0.15);

  const accentBadgeBg = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.2 : 0.12})`;
  const accentContrastText = getLuminance(accentHex) > 0.6 ? "#0f172a" : "#ffffff";

  const root = document.documentElement;

  // Toggle dark class for Tailwind compatibility
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Inject CSS Variables
  root.style.setProperty("--app-bg", bgHex);
  root.style.setProperty("--app-surface", surfaceHex);
  root.style.setProperty("--app-surface-hover", surfaceHoverHex);
  root.style.setProperty("--app-border", borderHex);
  root.style.setProperty("--app-text", textHex);
  root.style.setProperty("--app-text-muted", textMutedHex);

  root.style.setProperty("--app-accent", accentHex);
  root.style.setProperty("--app-accent-hover", accentHoverHex);
  root.style.setProperty("--app-accent-badge", accentBadgeBg);
  root.style.setProperty("--app-accent-rgb", `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
  root.style.setProperty("--app-accent-contrast", accentContrastText);

  // Save to LocalStorage
  localStorage.setItem(
    "prompt_studio_dual_tone_palette",
    JSON.stringify({ bg: bgHex, accent: accentHex, name: palette.name || "Personalizada" })
  );
}

// Load palette from LocalStorage
export function loadSavedPalette(): DualTonePalette {
  const saved = localStorage.getItem("prompt_studio_dual_tone_palette");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (isValidHex(parsed.bg) && isValidHex(parsed.accent)) {
        return parsed;
      }
    } catch (e) {
      console.error("Erro ao carregar paleta salva:", e);
    }
  }
  return DEFAULT_PALETTE;
}
