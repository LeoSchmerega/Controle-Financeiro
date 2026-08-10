// src/utils/paletaVisual.ts
// Paleta de cores e ícones do app — fonte única usada tanto na atribuição
// automática (FinanceContext) quanto nos seletores visuais (categorias e
// metas). Evita listas divergentes espalhadas pelos componentes.
export const PALETA_CORES = [
  "#8B0000",
  "#B45309",
  "#0F766E",
  "#1D4ED8",
  "#7E22CE",
  "#BE185D",
  "#4D7C0F",
  "#0369A1",
  "#64748B",
] as const;

export const ICONES_CATEGORIA = [
  "🏷️",
  "🍔",
  "🏠",
  "🚗",
  "💊",
  "📶",
  "🎓",
  "🎬",
  "🐾",
  "💰",
  "🛒",
  "✈️",
  "📦",
  "💡",
  "🎁",
] as const;

export const ICONES_META = [
  "🎯",
  "🏖️",
  "✈️",
  "🏠",
  "🚗",
  "🎓",
  "💍",
  "👶",
  "🛡️",
  "💻",
  "📱",
  "🎁",
] as const;
