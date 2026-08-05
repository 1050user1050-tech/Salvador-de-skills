import { AccentColor } from "../types/skill";

export interface ColorThemeOption {
  id: AccentColor;
  name: string;
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  ring: string;
  badgeBg: string;
  badgeText: string;
  hex: string;
}

export const ACCENT_COLORS: Record<AccentColor, ColorThemeOption> = {
  indigo: {
    id: "indigo",
    name: "Índigo",
    primaryBg: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
    primaryHover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/50",
    primaryText: "text-indigo-600 dark:text-indigo-400",
    ring: "focus:ring-indigo-500 dark:focus:ring-indigo-400",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    hex: "#6366f1",
  },
  violet: {
    id: "violet",
    name: "Violeta",
    primaryBg: "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600",
    primaryHover: "hover:bg-violet-50 dark:hover:bg-violet-950/50",
    primaryText: "text-violet-600 dark:text-violet-400",
    ring: "focus:ring-violet-500 dark:focus:ring-violet-400",
    badgeBg: "bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800",
    badgeText: "text-violet-700 dark:text-violet-300",
    hex: "#8b5cf6",
  },
  emerald: {
    id: "emerald",
    name: "Esmeralda",
    primaryBg: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
    primaryHover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
    primaryText: "text-emerald-600 dark:text-emerald-400",
    ring: "focus:ring-emerald-500 dark:focus:ring-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    hex: "#10b981",
  },
  amber: {
    id: "amber",
    name: "Âmbar",
    primaryBg: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600",
    primaryHover: "hover:bg-amber-50 dark:hover:bg-amber-950/50",
    primaryText: "text-amber-600 dark:text-amber-400",
    ring: "focus:ring-amber-500 dark:focus:ring-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
    badgeText: "text-amber-800 dark:text-amber-300",
    hex: "#f59e0b",
  },
  rose: {
    id: "rose",
    name: "Rosa",
    primaryBg: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600",
    primaryHover: "hover:bg-rose-50 dark:hover:bg-rose-950/50",
    primaryText: "text-rose-600 dark:text-rose-400",
    ring: "focus:ring-rose-500 dark:focus:ring-rose-400",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
    badgeText: "text-rose-700 dark:text-rose-300",
    hex: "#f43f5e",
  },
  cyan: {
    id: "cyan",
    name: "Ciano",
    primaryBg: "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600",
    primaryHover: "hover:bg-cyan-50 dark:hover:bg-cyan-950/50",
    primaryText: "text-cyan-600 dark:text-cyan-400",
    ring: "focus:ring-cyan-500 dark:focus:ring-cyan-400",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    hex: "#06b6d4",
  },
  slate: {
    id: "slate",
    name: "Grafite",
    primaryBg: "bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500",
    primaryHover: "hover:bg-slate-100 dark:hover:bg-slate-800",
    primaryText: "text-slate-700 dark:text-slate-300",
    ring: "focus:ring-slate-500 dark:focus:ring-slate-400",
    badgeBg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    badgeText: "text-slate-800 dark:text-slate-200",
    hex: "#64748b",
  },
};
